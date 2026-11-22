import os, math
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets', 'img')
os.makedirs(OUT, exist_ok=True)
def tile(inner, face='#f6f1dc', edge='#2f8f55'):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120">
<rect x="4" y="8" width="92" height="108" rx="12" fill="{edge}"/>
<rect x="4" y="4" width="92" height="106" rx="12" fill="{face}" stroke="#b9b08c" stroke-width="2"/>
{inner}</svg>'''
def circ(x, y, r, c): return f'<circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="{c}" stroke-width="5"/><circle cx="{x}" cy="{y}" r="{r/2.4:.1f}" fill="{c}"/>'
def bamboo(x, y, c='#1f8a3a'): return f'<rect x="{x}" y="{y}" width="12" height="34" rx="5" fill="{c}"/><rect x="{x}" y="{y+16}" width="12" height="3" fill="#f6f1dc"/>'
T = {}
T['t1'] = tile(circ(50,32,16,'#2a5bd7')+circ(30,78,14,'#c0392b')+circ(70,78,14,'#1f8a3a'))
T['t2'] = tile(''.join(bamboo(x,y) for x in (26,44,62) for y in (18,62)))
T['t3'] = tile('<polygon points="50,18 82,56 50,96 18,56" fill="#d62d2d"/><polygon points="50,34 66,56 50,78 34,56" fill="#f6f1dc"/>')
T['t4'] = tile('<rect x="22" y="24" width="56" height="62" rx="6" fill="#e6e0ff" stroke="#6a3fc4" stroke-width="6"/><rect x="36" y="40" width="28" height="30" rx="3" fill="#6a3fc4"/>')
T['t5'] = tile(''.join(f'<circle cx="{50+22*math.cos(a*1.2566):.1f}" cy="{58+22*math.sin(a*1.2566):.1f}" r="13" fill="#2a8fd7"/>' for a in range(5))+'<circle cx="50" cy="58" r="10" fill="#f6c945"/>')
T['t6'] = tile('<polygon points="50,18 60,46 90,46 66,64 75,92 50,75 25,92 34,64 10,46 40,46" fill="#8e44ad"/>')
T['t7'] = tile('<circle cx="50" cy="56" r="34" fill="#d62d2d"/><circle cx="50" cy="56" r="20" fill="#f6f1dc"/><circle cx="50" cy="56" r="9" fill="#d62d2d"/>')
T['t8'] = tile('<text x="50" y="80" font-size="62" text-anchor="middle" font-family="serif" font-weight="bold" fill="#1f8a3a">F</text>')
T['wild'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 120"><rect x="4" y="8" width="92" height="108" rx="12" fill="#9a6a00"/>
<rect x="4" y="4" width="92" height="106" rx="12" fill="#ffe27a" stroke="#c99000" stroke-width="3"/>
<path d="M14 62 Q50 38 86 62 L74 92 L26 92 Z" fill="#f5b800" stroke="#a87400" stroke-width="3"/><ellipse cx="50" cy="60" rx="30" ry="10" fill="#ffd84a" stroke="#a87400" stroke-width="3"/>
<text x="50" y="36" font-size="22" text-anchor="middle" font-family="sans-serif" font-weight="900" fill="#8a3b00">WILD</text></svg>'''
T['scat'] = tile('<circle cx="50" cy="52" r="34" fill="#f5b800" stroke="#a87400" stroke-width="5"/><rect x="38" y="40" width="24" height="24" fill="#c0392b"/><text x="50" y="102" font-size="14" text-anchor="middle" font-family="sans-serif" font-weight="900" fill="#c0392b">SCATTER</text>', face='#ffd2cc', edge='#a3231c')
T['btn'] = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="g" cx=".4" cy=".35"><stop offset="0" stop-color="#7dffa0"/><stop offset="1" stop-color="#0c7a3a"/></radialGradient></defs>
<circle cx="50" cy="50" r="46" fill="#c99000"/><circle cx="50" cy="50" r="40" fill="url(#g)"/>
<path d="M50 24a26 26 0 1 1-24 16" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/><polygon points="22,26 40,26 30,44" fill="#fff"/></svg>'''
for k, v in T.items():
    open(os.path.join(OUT, k + '.svg'), 'w', encoding='utf-8').write(v)
print('ok', len(T))