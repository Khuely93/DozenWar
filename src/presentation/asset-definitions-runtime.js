const RAW_ASSETS={
  IMG_MAP_001_BG:{type:'IMAGE',usage:'MAP_BG',source:'EMBEDDED_BOARD_BG'},
  IMG_HERO_INF_001_TOKEN:{type:'IMAGE',usage:'TOKEN',source:'SYMBOL_SHIELD',fallbackGlyph:'🛡️'},
  IMG_HERO_RODOC_TOKEN:{type:'IMAGE',usage:'TOKEN',source:'SYMBOL_SHIELD',fallbackGlyph:'🛡️'},
  IMG_HERO_EST_TOKEN:{type:'IMAGE',usage:'TOKEN',source:'PLACEHOLDER_EST',fallbackGlyph:'E'},
  IMG_HERO_ARCH_001_TOKEN:{type:'IMAGE',usage:'TOKEN',source:'SYMBOL_BOW',fallbackGlyph:'🏹'},
  IMG_HERO_CAV_001_TOKEN:{type:'IMAGE',usage:'TOKEN',source:'SYMBOL_HORSE',fallbackGlyph:'🐎'},
  IMG_UNIT_INF_001_TOKEN:{type:'IMAGE',usage:'TOKEN',source:'SYMBOL_SHIELD',fallbackGlyph:'🛡️'},
  IMG_UNIT_ARCH_001_TOKEN:{type:'IMAGE',usage:'TOKEN',source:'SYMBOL_BOW',fallbackGlyph:'🏹'},
  IMG_UNIT_CAV_001_TOKEN:{type:'IMAGE',usage:'TOKEN',source:'SYMBOL_HORSE',fallbackGlyph:'🐎'},
  VFX_HEAL_01:{type:'VFX'},VFX_DAMAGE_BUFF_01:{type:'VFX'},VFX_GUARD_01:{type:'VFX'},VFX_DODGE_01:{type:'VFX'},VFX_REFLECT_01:{type:'VFX'},
  ANIM_HERO_INF_001_ATTACK:{type:'ANIMATION'},ANIM_HERO_RODOC_ATTACK:{type:'ANIMATION'},ANIM_HERO_EST_ATTACK:{type:'ANIMATION'},ANIM_HERO_ARCH_001_ATTACK:{type:'ANIMATION'},ANIM_HERO_CAV_001_ATTACK:{type:'ANIMATION'}
};

// Display a head-and-shoulders window without redrawing the approved artwork.
const HeroPortrait={
  frame(frame,image,asset){
    const crop=asset?.portraitCrop;
    if(!crop)return;
    frame.classList.add('heroPortraitFrame');
    image.classList.add('heroPortraitArt');
    for(const [name,value] of Object.entries({
      width:1024/crop.width*100,height:1536/crop.height*100,
      left:-crop.x/crop.width*100,top:-crop.y/crop.height*100
    }))frame.style.setProperty('--hero-art-'+name,value+'%');
  }
};
