import re,os
D=os.path.dirname(os.path.abspath(__file__))
s=open(D+'/index.html').read()
title=re.search(r'<title>(.*?)</title>',s).group(1)
link=re.search(r'<link[^>]*fonts[^>]*>',s).group(0)
style=re.search(r'<style>.*?</style>',s,re.S).group(0)
body=s.split('<body>',1)[1].rsplit('</body>',1)[0]
open(D+'/artifact.html','w').write(f'<title>だれの ものがたり？</title>\n{link}\n{style}\n{body}')
print(len(s),len(body))
