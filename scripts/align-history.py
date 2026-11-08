from pathlib import Path
import json
c=json.loads(Path('research/church-learning.json').read_text(encoding='utf-8'))
for l in c:
    if len(l['paragraphs'])<4:
        l['paragraphs'].append('《十二使徒遺訓》係早期教會生活同教導嘅材料，可以同使徒行傳互相補充。兩份材料文體唔同，亦唔代表每個城市嘅教會生活完全一樣。' if l['id']=='early' else l['deeper'][0])
c[0]['events'][2].update(year=150,date='約二世紀',text='早期教會生活及教導材料流傳')
lines=Path('research/history-alignment.tsv').read_text(encoding='utf-8').strip().splitlines()
assert len(lines)==60
old=[]
for group in ['early','reformation','chinese']:
    old+=json.loads(Path('research/history-'+group+'.json').read_text(encoding='utf-8'))
new=[]
for u,l in enumerate(c):
    rows=[line.split('|') for line in lines[u*6:u*6+6]];events=l['events']
    for j in [0,1]:
        ev=events[j];dates=list(dict.fromkeys([ev['date']]+[x['date'] for x in events]+['約十七世紀','約十九世紀','約二十世紀']))[:4]
        rows.append([('按閱讀步驟，'+ev['text']+'係邊一步？') if u==9 else ('時間線中，「'+ev['text']+'」發生喺幾時？'),*dates,'e'+str(j)])
    names=[x['text'] for x in events[:3]]
    orders=[' → '.join(names),' → '.join([names[1],names[0],names[2]]),' → '.join(names[::-1]),' → '.join([names[0],names[2],names[1]])]
    rows.append(['「'+l['title']+'」時間線，以下先後次序邊個啱？',*orders,'e0,e1,e2'])
    ev=events[-1];alts=list(dict.fromkeys([ev['text']]+[x['text'] for x in events[:-1]]+['米蘭協議','馬禮遜抵達中國','沃爾姆斯會議']))[:4]
    rows.append(['「'+l['title']+'」時間線最後列出邊個'+('閱讀步驟？' if u==9 else '事件？'),*alts,'e'+str(len(events)-1)])
    for j,(stem,ans,b,co,d,evidence) in enumerate(rows):
        support=[]
        for code in evidence.split(','):
            support.append(l['paragraphs'][int(code[1:])] if code[0]=='p' else l['events'][int(code[1:])]['date']+' '+l['events'][int(code[1:])]['text'])
        base=old[u*10+j].copy()
        base.update(question=stem,options=[ans,b,co,d],answer=0,explanation='今課重點：'+' '.join(support)+'。'+l['summary'],learningEvidence=evidence.split(','),reference=l['period'],teachingSources=l['sources'])
        base['source']='https://lkw-gif.github.io/bible-buddy-hk/#/learn/church/'+l['id']
        base['verification']=base['source']
        base['sourceLabel']='閱讀材料（內部對照）'
        new.append(base)
assert len(new)==100 and len(set(q['question'] for q in new))==100
for name,a,b in [('early',0,30),('reformation',30,60),('chinese',60,100)]:
    Path('research/history-'+name+'.json').write_text(json.dumps(new[a:b],ensure_ascii=False,indent=2),encoding='utf-8')
Path('research/church-learning.json').write_text(json.dumps(c,ensure_ascii=False,indent=2),encoding='utf-8')
