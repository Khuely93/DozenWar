(async function prepare(files){
  const fs=require('fs'),path=require('path'),crypto=require('crypto'),sharp=require('sharp');
  if(files.length!==3)throw Error('Provide infantry, archer and cavalry sheets, in that order.');
  const root=path.resolve(__dirname,'..'),out=path.join(root,'assets','troops-v3'),preview=path.join(root,'..','..','outputs','troops-v3');
  fs.mkdirSync(out,{recursive:true});fs.mkdirSync(preview,{recursive:true});
  const kinds=['inf','arch','cav'],factions=['red','blue','gold','silver'],records=[],tiles=[];
  for(let k=0;k<3;k++){
    const bytes=fs.readFileSync(files[k]),meta=await sharp(bytes).metadata();
    records.push({kind:kinds[k],source:path.basename(files[k]),sha256:crypto.createHash('sha256').update(bytes).digest('hex'),width:meta.width,height:meta.height});
    for(let row=0;row<4;row++)for(let col=0;col<8;col++){
      const left=Math.round(col*meta.width/8),top=Math.round(row*meta.height/4),width=Math.round((col+1)*meta.width/8)-left,height=Math.round((row+1)*meta.height/4)-top;
      const raw=await sharp(bytes).extract({left,top,width,height}).ensureAlpha().raw().toBuffer();
      const n=width*height,seen=new Uint8Array(n),components=[];
      for(let i=0;i<n;i++){
        if(seen[i]||raw[i*4+3]<=12)continue;
        const queue=[i];seen[i]=1;
        for(let q=0;q<queue.length;q++){
          const index=queue[q],x=index%width,y=Math.floor(index/width);
          for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
            const nx=x+dx,ny=y+dy;if(nx<0||nx>=width||ny<0||ny>=height)continue;
            const next=ny*width+nx;if(!seen[next]&&raw[next*4+3]>12){seen[next]=1;queue.push(next)}
          }
        }
        components.push(queue);
      }
      components.sort((a,b)=>b.length-a.length);if(!components.length)throw Error('Empty sprite');
      const keep=new Uint8Array(n);for(const index of components[0])keep[index]=1;
      let x0=width,y0=height,x1=-1,y1=-1;
      for(let i=0;i<n;i++){
        if(!keep[i]){raw[i*4+3]=0;continue;}
        const x=i%width,y=Math.floor(i/width);x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y);
      }
      const bw=x1-x0+1,bh=y1-y0+1,scale=Math.min(238/bw,238/bh),sw=Math.round(bw*scale),sh=Math.round(bh*scale);
      const sprite=await sharp(raw,{raw:{width,height,channels:4}}).extract({left:x0,top:y0,width:bw,height:bh}).resize(sw,sh).png().toBuffer();
      const canvas=await sharp({create:{width:256,height:256,channels:4,background:{r:0,g:0,b:0,alpha:0}}}).composite([{input:sprite,left:Math.round(128-sw/2),top:248-sh}]).png().toBuffer();
      const name=kinds[k]+'-'+factions[row]+'-'+(col+1)+'.webp';
      await sharp(canvas).webp({lossless:true}).toFile(path.join(out,name));
      tiles.push({input:canvas,left:col*160+k*1280,top:row*190});
    }
  }
  const width=1280,height=760;
  for(let k=0;k<3;k++){
    const composite=tiles.slice(k*32,(k+1)*32).map(t=>({input:t.input,left:t.left-k*1280,top:t.top}));
    for(const t of composite){t.input=await sharp(t.input).resize(160,160).png().toBuffer();t.top+=24;}
    const labels='<svg width="1280" height="760">'+Array.from({length:4},(_,r)=>Array.from({length:8},(_,c)=>'<text x="'+(c*160+8)+'" y="'+(r*190+18)+'" fill="#2c241e" font-size="14">'+factions[r]+' / '+(c+1)+'</text>').join('')).join('')+'</svg>';
    composite.push({input:Buffer.from(labels),left:0,top:0});
    await sharp({create:{width,height,channels:4,background:'#cbbb9b'}}).composite(composite).png().toFile(path.join(preview,kinds[k]+'-contact.png'));
  }
  fs.writeFileSync(path.join(out,'manifest.json'),JSON.stringify({format:'lossless WebP',canvas:[256,256],anchor:[128,248],rows:factions,views:['front','front-right','right','back-right','back','back-left','left','front-left'],count:96,alphaThreshold:12,sources:records,notes:['Source directions are retained as supplied; exact 45-degree rotation is not guaranteed.','Mechanical crop, alpha cleanup and fit; no regenerated artwork.']},null,2)+'\n');
  console.log('Prepared 96 lossless WebP sprites and 3 contact sheets.');
})(process.argv.slice(2)).catch(error=>{console.error(error);process.exitCode=1;});
