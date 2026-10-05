"""Render the library design document's nine CDFDs; never execute the model.

Run: python docs/tools/render-library-dfd.py
The Markdown is the model source. HTML/SVG are offline documentation artifacts.
"""

from dataclasses import dataclass
from html import escape
from pathlib import Path
import json
import re
import shutil
import subprocess
import xml.etree.ElementTree as ET


FEATURES = Path(__file__).resolve().parents[1] / "features"
SOURCE = FEATURES / "library-management-process-model.md"
DESTINATION = FEATURES / "library-management-dfd.html"
TITLES = [
    "레벨0 · P0 · 전체 경계",
    "레벨1 · P0 → P1~P6 · 주요 처리",
    "레벨2 · P1 → P1.1~P1.4 · 접근 확인·입력 정규화",
    "레벨2 · P2 → P2.1~P2.4 · 공개/본인/관리 자료 조회",
    "레벨2 · P3 → P3.1~P3.5 · 대출·반납·연장·보충",
    "레벨2 · P4 → P4.1~P4.5 · 관리 변경·자료 정리",
    "레벨2 · P5 → P5.1~P5.6 · 프로필·수신·알림",
    "레벨2 · P6 → P6.1~P6.5 · 원본 관측·결과 확인",
    "레벨3 · P4.4 → P4.4.1~P4.4.5 · 자료 정리 상세",
]
DECOMPOSITIONS = [None, (0, "P0"), *[(1, f"P{i}") for i in range(1, 7)], (5, "P44")]


@dataclass
class Node:
    key: str
    label: str
    kind: str
    number: str = ""
    parent: str = ""


@dataclass
class Edge:
    key: str
    source: str
    target: str
    label: str
    kind: str


def parse(block):
    nodes = {}
    edges = []
    data_index = 0
    for line in block.splitlines():
        match = re.fullmatch(
            r"\s*([A-Za-z][A-Za-z0-9]*)\s*(?:\(\[(.+)\]\)|\[\((.+)\)\]|\[(.+)\])\s*", line
        )
        if match:
            key, process, store, terminator = match.groups()
            kind = "control" if key.startswith("K") else "process" if process else "store" if store else "terminator"
            if key in nodes:
                raise ValueError(f"Duplicate node {key}")
            label = process or store or terminator
            number = label.split(" · ", 1)[0] if kind in ("process", "control") else ""
            if number and not re.fullmatch(r"[PK]\d+(?:\.\d+)*", number):
                raise ValueError(f"Missing hierarchical process number: {key}: {label}")
            parent = (number.rsplit(".", 1)[0] if "." in number else "P0") if kind == "process" and number != "P0" else "P" + number[1:] if kind == "control" else ""
            nodes[key] = Node(key, label, kind, number, parent)
            continue
        match = re.fullmatch(r"\s*([A-Za-z][A-Za-z0-9]*)\s+(-->|-\.->)\|(.+)\|\s+([A-Za-z][A-Za-z0-9]*)\s*", line)
        if match:
            start, arrow, label, end = match.groups()
            kind = "control" if arrow == "-.->" else "data"
            if kind == "data":
                data_index += 1
                key = f"d{data_index:02}"
            else:
                key = label.split()[0]
            edges.append(Edge(key, start, end, label, kind))
    for edge in edges:
        if edge.source not in nodes or edge.target not in nodes:
            raise ValueError(f"Undefined endpoint: {edge}")
        if nodes[edge.source].kind in ("store", "terminator") and nodes[edge.target].kind in ("store", "terminator"):
            raise ValueError(f"Forbidden direct connection: {edge}")
        if edge.kind == "control" and (nodes[edge.source].kind == "store" or nodes[edge.target].kind == "store"):
            raise ValueError(f"Control flow connected to data store: {edge}")
    return nodes, edges


def hierarchy_metadata(graphs):
    metadata = []
    for index, (nodes, _) in enumerate(graphs):
        numbers = [node.number for key, node in nodes.items() if key in internal_keys(index, nodes) and node.kind == "process"]
        relation = DECOMPOSITIONS[index]
        parent = None
        ancestors = []
        if relation:
            parent_index, parent_key = relation
            number = graphs[parent_index][0][parent_key].number
            parent = {"index": parent_index, "key": parent_key, "number": number}
            ancestors = metadata[parent_index]["ancestors"] + [parent]
            for child in numbers:
                expected_parent = child.rsplit(".", 1)[0] if "." in child else "P0"
                if expected_parent != number:
                    raise ValueError(f"Hierarchy mismatch: {child} is not under {number}")
        children = {relation[1]: child_index for child_index, relation in enumerate(DECOMPOSITIONS)
                    if relation and relation[0] == index}
        metadata.append({"parent": parent, "ancestors": ancestors, "children": children,
                         "range": numbers[0] + ("~" + numbers[-1] if len(numbers) > 1 else "")})
    return metadata


def internal_keys(index, nodes):
    if index == 0:
        return {"P0"}
    if index == 1:
        return {f"P{i}" for i in range(1, 7)} | {"K0"}
    if index == 8:
        return {"A", "B", "C", "D", "E", "K44"}
    process = index - 1
    return {key for key in nodes if re.fullmatch(f"P{process}[1-9]", key)} | ({"K5"} if process == 5 else set())


def check_boundaries(graphs):
    """Static symbol/endpoint comparison, not a business-state simulation."""
    parent_edges = graphs[1][1]
    for process in range(1, 7):
        parent = f"P{process}"
        child_nodes, child_edges = graphs[process + 1]
        children = internal_keys(process + 1, child_nodes)
        for kind in ("data", "control"):
            incoming = {(e.source, e.key if kind == "control" else "data") for e in parent_edges if e.target == parent and e.kind == kind}
            outgoing = {(e.target, e.key if kind == "control" else "data") for e in parent_edges if e.source == parent and e.kind == kind}
            child_in = {(e.source, e.key if kind == "control" else "data") for e in child_edges if e.target in children and e.source not in children and e.source != "D5" and e.kind == kind}
            child_out = {(e.target, e.key if kind == "control" else "data") for e in child_edges if e.source in children and e.target not in children and e.target != "D5" and e.kind == kind}
            if incoming != child_in or outgoing != child_out:
                raise ValueError(f"Boundary mismatch: process {process}, {kind}: {incoming ^ child_in}, {outgoing ^ child_out}")
    # Level3 re-displays P1 and P45 as I and O; S1~4 are the same D1~4.
    aliases = {"I": "P1", "O": "P45", **{f"S{i}": f"D{i}" for i in range(1, 5)}}
    children = internal_keys(8, graphs[8][0])
    for kind in ("data", "control"):
        incoming = {(e.source, e.key if kind == "control" else "data") for e in graphs[5][1] if e.target == "P44" and e.kind == kind}
        outgoing = {(e.target, e.key if kind == "control" else "data") for e in graphs[5][1] if e.source == "P44" and e.kind == kind}
        child_in = {(aliases.get(e.source, e.source), e.key if kind == "control" else "data") for e in graphs[8][1] if e.target in children and e.source not in children and e.kind == kind}
        child_out = {(aliases.get(e.target, e.target), e.key if kind == "control" else "data") for e in graphs[8][1] if e.source in children and e.target not in children and e.kind == kind}
        if incoming != child_in or outgoing != child_out:
            raise ValueError(f"Level3 boundary mismatch: {kind}: {incoming ^ child_in}, {outgoing ^ child_out}")
    expected = {(e.source, e.key) for e in graphs[0][1] if e.kind == "control"}
    actual = {(e.source, e.key) for e in graphs[1][1] if e.kind == "control" and e.source == "W"}
    if expected != actual:
        raise ValueError("Context control boundary mismatch")


def wrap(label, maximum=18):
    lines, current, width = [], "", 0
    for char in re.findall(r"[A-Za-z0-9._-]+|.", label):
        size = sum(1 if ord(letter) > 255 else 0.56 for letter in char)
        if width + size > maximum and current:
            lines.append(current.strip())
            current, width = "", 0
        current += char
        width += size
    if current:
        lines.append(current.strip())
    return lines


SVG_NS = "http://www.w3.org/2000/svg"
ET.register_namespace("", SVG_NS)


def view_job(index, nodes, edges, layer, focus, direction):
    def in_scope(edge):
        uses_store = nodes[edge.source].kind == "store" or nodes[edge.target].kind == "store"
        if focus == "@process":
            return not uses_store
        if focus == "@stores":
            return uses_store
        return not focus or edge.source == focus or edge.target == focus

    selected = [(number, edge) for number, edge in enumerate(edges)
                if (layer == "all" or edge.kind == layer)
                and in_scope(edge)]
    job_id = f"d{index}-{layer}-{focus or 'all'}-{direction}"
    aliases = {}
    job_nodes = {}
    job_edges = []
    primary = internal_keys(index, nodes)

    def alias(key, peer, role):
        # Repeat stores beside the process using them, instead of long shared buses.
        value = f"{key}_{role}_{peer}" if nodes[key].kind == "store" else key
        aliases[value] = key
        label = nodes[key].number + "\n" + "\n".join(wrap(nodes[key].label.split(" · ", 1)[1], 14)) if nodes[key].number else "\n".join(wrap(nodes[key].label, 14))
        job_nodes[value] = {"id": value, "label": label,
                            "kind": nodes[key].kind, "primary": key in primary}
        return value

    for number, edge in selected:
        start = alias(edge.source, edge.target, "read")
        end = alias(edge.target, edge.source, "write")
        response = (index == 1 and edge.target == "P1") or (index == 2 and edge.source in {"P2", "P3", "P4", "P5", "P6"}) or edge.label.startswith("F08")
        if edge.kind == "control" and nodes[edge.target].kind == "control" and nodes[edge.source].kind == "process":
            response = any(other.source == edge.target for _, other in selected)
        job_edges.append({"source": start, "target": end, "key": edge.key,
                          "kind": edge.kind, "index": number, "indices": [number], "response": response})
    merged = {}
    for edge in job_edges:
        key = (edge["source"], edge["target"], edge["kind"]) if edge["kind"] == "control" else (edge["index"],)
        if key not in merged:
            merged[key] = edge
        else:
            merged[key]["indices"].extend(edge["indices"])
            prefix = merged[key]["key"].split('-', 1)[0] + '-'
            merged[key]["key"] += ' / ' + (edge["key"][len(prefix):] if edge["key"].startswith(prefix) else edge["key"])
    return {"id": job_id, "layer": layer, "direction": direction, "nodes": list(job_nodes.values()),
            "edges": list(merged.values()), "aliases": aliases, "selected": [n for n, _ in selected]}


def decorate_svg(job, nodes, rendered):
    if not job["edges"]:
        return f'<svg class="diagram" viewBox="0 0 640 220" role="img"><title>해당 흐름 없음</title><text x="320" y="105" text-anchor="middle" fill="#495b6c" font-size="18">이 범위에는 해당 종류의 흐름이 없습니다.</text></svg>'
    svg = ET.fromstring(rendered)
    svg.attrib.pop("width", None)
    svg.attrib.pop("height", None)
    svg.set("class", "diagram")
    svg.set("role", "img")
    svg.set("aria-label", "데이터 또는 제어 흐름 도면. 처리를 선택하면 해당 연결만 표시합니다.")
    for group in svg.findall(f".//{{{SVG_NS}}}g"):
        kind = group.get("class", "")
        title = group.find(f"{{{SVG_NS}}}title")
        if kind == "node" and title is not None:
            real = job["aliases"][title.text]
            node = nodes[real]
            group.set("data-node", real)
            group.set("data-kind", node.kind)
            primary = any(n["id"] == title.text and n["primary"] for n in job["nodes"])
            if primary and node.kind != "store":
                group.set("data-primary", "true")
                group.set("tabindex", "0")
                group.set("role", "button")
                group.set("aria-label", node.label + "의 연결 보기")
            title.text = node.label
            if node.number:
                title.text += " / 부모 " + node.parent if node.parent else ""
                for text in group.findall(f"{{{SVG_NS}}}text"):
                    if text.text == node.number:
                        text.set("font-weight", "700")
            if node.kind == "store":
                polygon = group.find(f"{{{SVG_NS}}}polygon")
                points = [tuple(map(float, p.split(','))) for p in polygon.get("points").split()]
                x0, x1 = min(p[0] for p in points), max(p[0] for p in points)
                y0, y1 = min(p[1] for p in points), max(p[1] for p in points)
                group.remove(polygon)
                group.insert(1, ET.Element(f"{{{SVG_NS}}}path", {
                    "d": f"M{x0},{y0} H{x1} M{x0},{y1} H{x1}",
                    "fill": "none", "stroke": "#507fb8", "stroke-width": "1.5"}))
        if kind == "edge":
            number = group.get("id").rsplit('-', 1)[1]
            group.set("class", "flow")
            group.set("data-flow", str(number))
            entry = next(edge for edge in job["edges"] if edge["index"] == int(number))
            group.set("data-flows", ','.join(str(n) for n in entry["indices"]))
            group.set("tabindex", "0")
            group.set("role", "button")
            if group.find(f"{{{SVG_NS}}}text") is None:
                # Dot omits external labels when it packs disconnected components.
                path = group.find(f"{{{SVG_NS}}}path")
                coordinates = list(map(float, re.findall(r"-?\d+(?:\.\d+)?", path.get("d"))))
                points = list(zip(coordinates[::2], coordinates[1::2]))
                start, end = max(zip(points, points[1:]), key=lambda pair: abs(pair[1][0] - pair[0][0]) + abs(pair[1][1] - pair[0][1]))
                horizontal = abs(end[0] - start[0]) > abs(end[1] - start[1])
                label = ET.SubElement(group, f"{{{SVG_NS}}}text", {
                    "x": str((start[0] + end[0]) / 2 + (0 if horizontal else 5)),
                    "y": str((start[1] + end[1]) / 2 - 5),
                    "text-anchor": "middle" if horizontal else "start",
                    "font-family": "Malgun Gothic, sans-serif", "font-size": "12",
                    "fill": "#244e81", "stroke": "white", "stroke-width": "4", "paint-order": "stroke"})
                label.text = entry["key"]
    return ET.tostring(svg, encoding="unicode")


def render_views(graphs):
    jobs = []
    choices = []
    for index, (nodes, edges) in enumerate(graphs):
        keys = [key for key in nodes if key in internal_keys(index, nodes) and nodes[key].kind != "store"]
        choices.append(keys)
        for layer in ("data", "control", "all"):
            scopes = [""] + ([] if layer == "control" else ["@process", "@stores"]) + keys
            for focus in scopes:
                for direction in ("LR", "TB"):
                    jobs.append(view_job(index, nodes, edges, layer, focus, direction))
    populated = [job for job in jobs if job["edges"]]
    helper = Path(__file__).with_name("layout-library-dfd.cjs")
    node = shutil.which("node") or str(Path.home() / ".cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe")
    result = subprocess.run([node, str(helper)], input=json.dumps(populated, ensure_ascii=False),
                            text=True, encoding="utf-8", capture_output=True, check=True, timeout=60)
    outputs = {item["id"]: item["svg"] for item in json.loads(result.stdout)}
    views = {}
    for job in jobs:
        diagram_index = int(job["id"].split('-')[0][1:])
        views[job["id"]] = {"svg": decorate_svg(job, graphs[diagram_index][0], outputs.get(job["id"])),
                            "selected": job["selected"]}
    return views, choices


LEGEND = '''<svg class="legend" viewBox="0 0 1150 155" role="img" aria-label="사용자 참고와 같은 CDFD 범례">
<ellipse cx="85" cy="35" rx="67" ry="25" class="bubble"/><text x="172" y="40">Data Process · 데이터 처리</text>
<ellipse cx="85" cy="95" rx="67" ry="25" class="bubble" stroke-dasharray="7 4"/><text x="172" y="100">Control Process · 제어 처리</text>
<rect x="474" y="12" width="130" height="43" class="bubble"/><text x="622" y="40">Terminator · 외부 종단</text>
<path d="M474,80 H604 M474,114 H604" class="store"/><text x="622" y="101">Data Store · 저장소</text>
<defs><marker id="legend-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1,1 L9,5 L1,9" fill="none" stroke="#4f7eb7" stroke-width="1.5"/></marker></defs>
<path d="M850,35 H940" class="flow-line" marker-end="url(#legend-arrow)"/><text x="960" y="40">Data Flow</text>
<path d="M850,95 H940" class="flow-line control-line" marker-end="url(#legend-arrow)"/><text x="960" y="100">Control Flow</text>
</svg>'''


PAGE_TOP = r'''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>도서관리 CDFD · 레벨0~3</title>
<style>
*{box-sizing:border-box}body{margin:0;background:#fff;color:#162638;font:14px/1.6 "Malgun Gothic",system-ui,sans-serif}main{margin:auto;max-width:1600px;padding:14px 18px}h1{font-size:21px;margin:0}h2{font-size:16px;margin:0}.title-line{display:flex;gap:16px;align-items:center;justify-content:space-between;flex-wrap:wrap}.secondary{color:#495b6c;font-size:12px}a{color:#245e9f}header{border-bottom:1px solid #d3dde8;padding-bottom:10px}.legend{width:100%;max-width:1100px;margin:8px 0}.legend text{font:17px "Malgun Gothic",sans-serif;fill:#162638}.bubble{fill:#507fb8;stroke:#335f95;stroke-width:2}.store{fill:none;stroke:#507fb8;stroke-width:2}.flow-line{fill:none;stroke:#4f7eb7;stroke-width:1.65}.control-line{stroke-dasharray:6 4}.legend-wrap{margin-top:4px}summary{cursor:pointer}.toolbar{display:flex;gap:10px;align-items:center;flex-wrap:wrap;padding:12px 0}label{white-space:nowrap}select,button{font:inherit;color:inherit}select{padding:6px 8px;border:1px solid #9aadc1;border-radius:4px;background:#fff;min-width:0;max-width:100%}#diagram-select{flex:1 1 310px;max-width:490px}#scope-select{flex:1 1 200px;max-width:310px}.layers,.zoom-controls{display:flex;gap:4px;align-items:center}button{padding:6px 10px;border:1px solid #9aadc1;border-radius:4px;background:#fff;cursor:pointer}button[aria-pressed="true"]{background:#e8f0fb;border-color:#335f95;color:#244e81}.zoom-controls{margin-left:auto}button:focus-visible,select:focus-visible,summary:focus-visible{outline:3px solid #3c75b6;outline-offset:2px}#zoom-value{min-width:42px;text-align:center;font-size:12px}.hierarchy{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:0 0 8px;font-size:12px}.hierarchy button{padding:3px 7px;font-size:12px}.hierarchy-path{display:flex;gap:5px;align-items:center;flex-wrap:wrap}.hierarchy-path strong{color:#244e81}.view-heading{display:flex;gap:12px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:6px}.viewport{overflow:auto;border:1px solid #d3dde8;border-radius:4px;padding:8px;background:#fff;height:calc(100dvh - 205px);min-height:120px;overscroll-behavior:contain}.canvas{display:flex;align-items:center;justify-content:center}.diagram{display:block;flex:none;max-width:none}.node[data-primary]{cursor:pointer}.flow{cursor:pointer}.flow:focus,.node:focus{outline:none}.flow.selected path{stroke:#173e70;stroke-width:3}.flow.selected polygon{fill:#173e70;stroke:#173e70}.flow.selected text{fill:#173e70;font-weight:700}.detail{margin:7px 0;color:#244e81;font-size:13px;min-height:21px}#flow-details{margin-top:10px}.table-wrap{overflow:auto}.flow-table{width:100%;border-collapse:collapse;margin:8px 0 18px;font-size:13px}.flow-table th,.flow-table td{padding:7px 9px;text-align:left;vertical-align:top;border-bottom:1px solid #d9e3ed}.flow-table th{background:#f4f7fb}.flow-table tr.selected{background:#e8f0fb}.edge-key{padding:2px 6px;white-space:nowrap;font-size:12px}.kind{white-space:nowrap}.notes{color:#495b6c;font-size:12px;margin:12px 0}p{margin:5px 0}#legend-details p{font-size:12px}#legend-details{margin-top:5px}[hidden]{display:none!important}@media(max-width:600px){main{padding:10px}#diagram-select{max-width:none;flex-basis:100%}#scope-select{max-width:none;flex-basis:100%}.toolbar{gap:7px;padding:9px 0}.zoom-controls{margin-left:auto}.title-line .secondary{font-size:11px}}@media print{.toolbar,.notes,#legend-details{display:none}.viewport{height:auto!important;overflow:visible;border:0;padding:0}.canvas{width:auto!important;height:auto!important}.diagram{width:100%!important;height:auto!important}.detail{display:none}#flow-details{display:block}}
</style></head><body><main><header><div class="title-line"><h1>도서관리 · CDFD</h1><span class="secondary">레벨0 → 1 → 2 → 3 · 업무 테스트 보류</span></div><details id="legend-details"><summary>CDFD 범례</summary><div class="legend-wrap">__LEGEND__</div><p>같은 저장소 ID의 반복 표시는 동일 저장소입니다. 실선은 데이터, 점선은 제어 사건이며 선의 교차는 연결점이 아닙니다.</p></details></header>
<nav class="toolbar" aria-label="도면 보기"><select id="diagram-select" aria-label="DFD 레벨·처리">__OPTIONS__</select><div class="layers" role="group" aria-label="흐름 종류"><button data-layer="data" aria-pressed="true">데이터</button><button data-layer="control" aria-pressed="false">제어</button><button data-layer="all" aria-pressed="false">함께</button></div><select id="scope-select" aria-label="연결 범위 또는 처리 선택"></select><div class="zoom-controls"><button id="zoom-out" aria-label="축소">−</button><output id="zoom-value"></output><button id="zoom-in" aria-label="확대">+</button><button id="fit">전체 맞춤</button></div></nav>
<nav class="hierarchy" aria-label="프로세스 분해 계층"><button id="parent-diagram" hidden>상위 도면</button><div id="hierarchy-path" class="hierarchy-path"></div><button id="child-diagram" hidden>하위 도면</button></nav>
<section><div class="view-heading"><h2 id="view-title"></h2><span class="secondary" id="view-count"></span></div><div class="viewport"><div class="canvas"></div></div><p class="detail" aria-live="polite">처리를 누르면 그 처리의 입출력만 크게 볼 수 있습니다.</p><details id="flow-details"><summary>현재 그림의 흐름 이름·입출력 보기</summary><div class="table-wrap"><table class="flow-table"><thead><tr><th>ID</th><th>유형</th><th>출처 → 소비자</th><th>흐름 이름·구성</th></tr></thead><tbody id="flow-body"></tbody></table></div></details></section>
<section class="notes"><p>처리 번호: P0는 전체 시스템, P1~P6은 주요 처리, P4.4는 P4의 네 번째 하위 처리, P4.4.1은 P4.4의 첫 번째 하위 처리입니다. 제어 처리 K0/K5/K4.4는 각각 P0/P5/P4.4 내부에 속하며 K4.4의 기존 문서 ID는 K44입니다.</p><p>데이터와 제어는 같은 레벨의 모델을 나눠 보여줍니다. ‘함께’는 둘을 모두 표시합니다. 주요 처리의 기본 보기는 처리·외부 연결이며, 메뉴에서 저장소 연결 또는 모든 연결을 선택할 수 있습니다. 그림 오른쪽의 표시 수는 전체 흐름 대비 현재 범위입니다. 저장소는 사용하는 처리 옆에 같은 ID로 다시 표시합니다. 같은 출발·도착의 제어 사건은 ID를 묶어 한 연결로 표시하며, 개별 사건은 흐름 표에 모두 남깁니다.</p><p><a href="library-management-process-model.md">원문·프로세스 명세·CSPEC</a> · <a href="library-management-design.md">OOD 계약</a> · CF48~55 보류 유지</p></section></main>
<script>
const models=__MODELS__,views=__VIEWS__,choices=__CHOICES__;
const diagramSelect=document.querySelector('#diagram-select'),scopeSelect=document.querySelector('#scope-select'),viewport=document.querySelector('.viewport'),canvas=document.querySelector('.canvas'),zoomValue=document.querySelector('#zoom-value');
const state={index:0,layer:'data',focus:'',fit:true,scale:1,orientation:'LR'};
function fitBounds(availableWidth,availableHeight,graphWidth,graphHeight){return Math.min((availableWidth-20)/graphWidth,(availableHeight-20)/graphHeight,2);}
function sizeViewport(){const top=viewport.getBoundingClientRect().top;viewport.style.height=Math.max(120,window.innerHeight-Math.max(0,top)-16)+'px';}
function applyScale(){const svg=canvas.querySelector('svg');if(!svg)return;const box=svg.viewBox.baseVal;if(state.fit)state.scale=fitBounds(viewport.clientWidth,viewport.clientHeight,box.width,box.height);const width=box.width*state.scale,height=box.height*state.scale;svg.style.width=width+'px';svg.style.height=height+'px';canvas.style.width=Math.max(viewport.clientWidth-18,width)+'px';canvas.style.height=Math.max(viewport.clientHeight-18,height)+'px';zoomValue.value=Math.round(state.scale*100)+'%';if(state.fit){viewport.scrollLeft=0;viewport.scrollTop=0;}}
function populateScope(){scopeSelect.replaceChildren(new Option('모든 연결',''));if(state.layer!=='control'){scopeSelect.add(new Option('처리·외부 연결 (저장소 제외)','@process'));scopeSelect.add(new Option('저장소 연결','@stores'));}for(const key of choices[state.index])scopeSelect.add(new Option(models[state.index].nodes[key].label+' 연결',key));scopeSelect.value=state.focus;}
function goToDiagram(index,focus=''){state.index=index;diagramSelect.value=String(index);state.focus=focus||(index===1&&state.layer!=='control'?'@process':'');state.fit=true;populateScope();render();}
function renderHierarchy(){const model=models[state.index],hierarchy=model.hierarchy,path=document.querySelector('#hierarchy-path'),parentButton=document.querySelector('#parent-diagram'),childButton=document.querySelector('#child-diagram');path.replaceChildren();for(const ancestor of hierarchy.ancestors){const button=document.createElement('button');button.textContent=ancestor.number;button.title=models[ancestor.index].nodes[ancestor.key].label+'가 표시된 상위 도면';button.addEventListener('click',()=>goToDiagram(ancestor.index,ancestor.key));path.append(button,document.createTextNode(' → '));}const current=document.createElement('strong');current.textContent=hierarchy.range;path.append(current);parentButton.hidden=!hierarchy.parent;if(hierarchy.parent){const parent=hierarchy.parent;parentButton.textContent='↑ 상위 '+parent.number;parentButton.onclick=()=>goToDiagram(parent.index,parent.key);}const focus=state.focus||(state.index===0?'P0':'');const child=hierarchy.children[focus];childButton.hidden=child===undefined;if(child!==undefined){childButton.textContent=model.nodes[focus].number+' 하위: '+models[child].hierarchy.range;childButton.onclick=()=>goToDiagram(child);}}
function describe(edge){const model=models[state.index];return edge.key+' · '+(edge.kind==='control'?'제어':'데이터')+' · '+model.nodes[edge.source].label+' → '+model.nodes[edge.target].label+' · '+edge.label;}
function selectFlow(number){canvas.querySelectorAll('[data-flow]').forEach(e=>e.classList.toggle('selected',e.dataset.flows.split(',').map(Number).includes(number)));document.querySelectorAll('#flow-body [data-flow]').forEach(e=>e.classList.toggle('selected',Number(e.dataset.flow)===number));document.querySelector('.detail').textContent=describe(models[state.index].edges[number]);}
function render(){renderHierarchy();sizeViewport();const prefix='d'+state.index+'-'+state.layer+'-'+(state.focus||'all')+'-';function fitted(direction){const svg=new DOMParser().parseFromString(views[prefix+direction].svg,'image/svg+xml').documentElement;const box=svg.getAttribute('viewBox').split(/\s+/).map(Number);return fitBounds(viewport.clientWidth,viewport.clientHeight,box[2],box[3]);}state.orientation=fitted('TB')>fitted('LR')?'TB':'LR';const key='d'+state.index+'-'+state.layer+'-'+(state.focus||'all')+'-'+state.orientation;const view=views[key],model=models[state.index];canvas.innerHTML=view.svg;document.querySelector('#view-title').textContent=model.title+(state.focus.startsWith('@')?' · '+scopeSelect.selectedOptions[0].text:state.focus?' · 선택한 처리':'');document.querySelector('#view-count').textContent=(state.layer==='data'?'데이터':state.layer==='control'?'제어':'데이터 + 제어')+' · 표시 '+view.selected.length+' / '+model.edges.filter(edge=>state.layer==='all'||edge.kind===state.layer).length+'개 흐름';document.querySelectorAll('[data-layer]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.layer===state.layer)));const body=document.querySelector('#flow-body');body.replaceChildren();for(const number of view.selected){const edge=model.edges[number],row=document.createElement('tr');row.dataset.flow=number;const id=document.createElement('td'),button=document.createElement('button');button.className='edge-key';button.textContent=edge.key;button.addEventListener('click',()=>selectFlow(number));id.append(button);row.append(id);for(const text of [edge.kind==='control'?'제어 · 점선':'데이터 · 실선',model.nodes[edge.source].label+' → '+model.nodes[edge.target].label,edge.label]){const cell=document.createElement('td');cell.textContent=text;row.append(cell);}body.append(row);}canvas.querySelectorAll('[data-flow]').forEach(flow=>{const number=Number(flow.dataset.flow);flow.addEventListener('click',()=>selectFlow(number));flow.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();selectFlow(number);}});});canvas.querySelectorAll('[data-primary]').forEach(node=>{function focus(){state.focus=node.dataset.node;scopeSelect.value=state.focus;state.fit=true;render();}node.addEventListener('click',focus);node.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();focus();}});});document.querySelector('.detail').textContent=state.focus.startsWith('@')?'연결 범위를 나눈 보기입니다. 선택 메뉴의 ‘모든 연결’에서 전체 도면을 볼 수 있습니다.':state.focus?models[state.index].nodes[state.focus].label+(models[state.index].nodes[state.focus].parent?' · 부모 '+models[state.index].nodes[state.focus].parent:'')+'의 연결입니다. ‘모든 연결’로 돌아갈 수 있습니다.':'처리를 누르면 그 처리의 입출력만 크게 볼 수 있습니다.';applyScale();}
diagramSelect.addEventListener('change',()=>goToDiagram(Number(diagramSelect.value)));scopeSelect.addEventListener('change',()=>{state.focus=scopeSelect.value;state.fit=true;render();});document.querySelectorAll('[data-layer]').forEach(button=>button.addEventListener('click',()=>{state.layer=button.dataset.layer;if(state.layer==='control'&&state.focus.startsWith('@'))state.focus='';state.fit=true;populateScope();render();}));document.querySelector('#fit').addEventListener('click',()=>{state.fit=true;sizeViewport();applyScale();});document.querySelector('#zoom-in').addEventListener('click',()=>{state.fit=false;state.scale=Math.min(5,state.scale*1.25);applyScale();});document.querySelector('#zoom-out').addEventListener('click',()=>{state.fit=false;state.scale=Math.max(.01,state.scale/1.25);applyScale();});window.addEventListener('resize',()=>{state.fit=true;render();});document.querySelector('#legend-details').addEventListener('toggle',()=>{state.fit=true;render();});populateScope();render();
</script></body></html>'''


def main():
    source = SOURCE.read_text(encoding="utf-8")
    blocks = re.findall(r"```mermaid\s*\n(.*?)```", source, re.S)
    if len(blocks) != 10:
        raise ValueError("Expected 9 CDFDs followed by the separate SASD module diagram")
    graphs = [parse(block) for block in blocks[:9]]
    check_boundaries(graphs)
    hierarchy = hierarchy_metadata(graphs)
    views, choices = render_views(graphs)
    models = [{"title": TITLES[index], "nodes": {key: vars(node) for key, node in nodes.items()},
               "edges": [vars(edge) for edge in edges], "hierarchy": hierarchy[index]} for index, (nodes, edges) in enumerate(graphs)]
    options = "".join(f'<option value="{index}">{escape(title)}</option>' for index, title in enumerate(TITLES))
    content = PAGE_TOP.replace("__LEGEND__", LEGEND).replace("__OPTIONS__", options)
    for token, data in (("__MODELS__", models), ("__VIEWS__", views), ("__CHOICES__", choices)):
        content = content.replace(token, json.dumps(data, ensure_ascii=False).replace("<", "\\u003c"))
    DESTINATION.write_text(content, encoding="utf-8")
    print(json.dumps({"artifact": str(DESTINATION), "diagrams": len(graphs), "views": len(views),
                      "staticBoundaryComparison": "matched"}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
