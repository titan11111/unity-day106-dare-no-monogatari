import asyncio,sys,json,time
from playwright.async_api import async_playwright
order=sys.argv[1].split(',') if len(sys.argv)>1 else ['hero','vb','mayor','minister','hermit','gal','rogue']
out=sys.argv[2] if len(sys.argv)>2 else '/tmp/run.log'
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path='/usr/bin/google-chrome',args=['--no-sandbox'])
        pg=await b.new_page(viewport={'width':800,'height':700})
        errs=[]
        pg.on('pageerror',lambda e:errs.append(str(e)))
        pg.on('console',lambda m:errs.append('console:'+m.text) if m.type=='error' else None)
        await pg.goto('file:///home/claude/dq/test/fast.html')
        await pg.wait_for_timeout(1500)
        await pg.add_script_tag(path='/home/claude/dq/test/bot.js')
        # when starting at a later story, jump directly
        first=order[0]
        if first=='cat':
            await pg.evaluate("localStorage.setItem('dq_cleared',JSON.stringify(['hero','vb','mayor','minister','hermit','gal','rogue']))")
        elif first!='hero':
            await pg.evaluate("localStorage.setItem('dq_cleared','[\"hero\"]')")
        task=asyncio.create_task(pg.evaluate("order=>bot.run(order)",order))
        n=0;t0=time.time()
        f=open(out,'w')
        while not task.done():
            await asyncio.sleep(2)
            lg=await pg.evaluate("bot.log.splice(0)")
            for l in lg: f.write(l+'\n')
            if errs:
                for e in errs: f.write('ERR '+e+'\n')
                errs.clear()
            f.flush()
            if int(time.time()-t0)%20<2:
                d=await pg.evaluate("bot.dump()")
                f.write('STATE '+json.dumps(d,ensure_ascii=False)+'\n');f.flush()
        try:
            r=await task;f.write('RESULT '+str(r)+'\n')
        except Exception as e:
            f.write('FAIL '+str(e)[:1500]+'\n')
            try:
                d=await pg.evaluate("bot.dump()");f.write('STATE '+json.dumps(d,ensure_ascii=False)+'\n')
                await pg.evaluate("window.NODRAW=false");await pg.wait_for_timeout(400)
                await pg.screenshot(path=out+'.png')
            except Exception as e2: f.write('dumpfail '+str(e2)+'\n')
        lg=await pg.evaluate("bot.log.splice(0)")
        for l in lg: f.write(l+'\n')
        for e in errs: f.write('ERR '+e+'\n')
        f.write('STATS '+json.dumps(await pg.evaluate("bot.st"))+'\n')
        f.close();await b.close()
asyncio.run(main())
