export function initHallSlideshow(photos){
  const root=document.querySelector('#hall-gallery-grid'),section=root.closest('section'),reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const number=v=>new Intl.NumberFormat('ar-SA').format(v);
  let index=0,timer=null,userPaused=reduced.matches,hovered=false,focused=false,modal=false,outside=false,suppressUntil=0;
  root.className='hall-slideshow';root.setAttribute('role','region');root.setAttribute('aria-roledescription','عارض صور');root.setAttribute('aria-label','صور القاعة الأولى');
  root.innerHTML=photos.map((p,i)=>`<button type="button" class="hero-slide ${i===0?'is-active':''}" data-photo="${i}" aria-label="تكبير ${p.name}" aria-hidden="${i!==0}" tabindex="${i===0?'0':'-1'}"><img ${i===0?'id="hall-cover" fetchpriority="high"':'loading="eager"'} src="${p.src}" srcset="${p.src.replace('.webp','-960.webp')} 960w, ${p.src} 1600w" sizes="(max-width:760px) calc(100vw - 40px), 1240px" alt="${p.name} — القاعة الأولى" width="1600" height="1067" decoding="async"></button>`).join('')+`<button type="button" class="hero-gallery-arrow hero-gallery-prev" aria-label="الصورة السابقة"><svg><use href="#h-arrow"/></svg></button><button type="button" class="hero-gallery-arrow hero-gallery-next" aria-label="الصورة التالية"><svg><use href="#h-arrow"/></svg></button><div class="hero-gallery-dots" role="group" aria-label="اختر صورة">${photos.map((p,i)=>`<button type="button" data-slide="${i}" aria-label="عرض ${p.name}" aria-pressed="${i===0}" class="${i===0?'active':''}"></button>`).join('')}</div><div class="hero-gallery-playback"><button type="button" class="hero-gallery-pause" aria-label="إيقاف تبديل الصور"><span aria-hidden="true">Ⅱ</span></button><span class="hero-gallery-count" aria-live="off">١ / ${number(photos.length)}</span></div>`;
  const slides=[...root.querySelectorAll('.hero-slide')],dots=[...root.querySelectorAll('[data-slide]')],pause=root.querySelector('.hero-gallery-pause');
  function playback(){clearInterval(timer);timer=null;const stopped=userPaused||hovered||focused||modal||outside||document.hidden;pause.setAttribute('aria-label',userPaused?'تشغيل تبديل الصور':'إيقاف تبديل الصور');pause.setAttribute('aria-pressed',String(userPaused));pause.querySelector('span').textContent=userPaused?'▶':'Ⅱ';if(!stopped)timer=setInterval(()=>show(index+1,false),3400)}
  function show(next,manual=true){
    index=(next+photos.length)%photos.length;
    slides.forEach((slide,i)=>{
      let offset=(i-index+photos.length)%photos.length;if(offset>photos.length/2)offset-=photos.length;
      slide.classList.toggle('is-active',offset===0);slide.classList.toggle('is-previous',offset===-1);slide.classList.toggle('is-next',offset===1);
      slide.style.setProperty('--slide-x',`${offset*100}%`);slide.style.setProperty('--slide-gap',`${offset*12}px`);slide.style.setProperty('--slide-scale',offset===0?'1':'.94');
      slide.querySelector('img').style.objectPosition=photos[i].position||'center 54%';
      slide.setAttribute('aria-hidden',String(offset!==0));slide.tabIndex=offset===0?0:-1;
    });
    dots.forEach((dot,i)=>{dot.classList.toggle('active',i===index);dot.setAttribute('aria-pressed',String(i===index))});root.querySelector('.hero-gallery-count').textContent=`${number(index+1)} / ${number(photos.length)}`;document.querySelector('#photo-kind').textContent=photos[index].name;section.dataset.currentSlide=index;if(manual)playback();
  }
  root.querySelector('.hero-gallery-prev').addEventListener('click',()=>show(index-1));root.querySelector('.hero-gallery-next').addEventListener('click',()=>show(index+1));dots.forEach(dot=>dot.addEventListener('click',()=>show(Number(dot.dataset.slide))));pause.addEventListener('click',()=>{userPaused=!userPaused;playback()});
  root.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();show(index+1)}if(e.key==='ArrowRight'){e.preventDefault();show(index-1)}});
  if(matchMedia('(hover:hover)').matches){section.addEventListener('mouseenter',()=>{hovered=true;playback()});section.addEventListener('mouseleave',()=>{hovered=false;playback()})}
  section.addEventListener('focusin',()=>{focused=true;playback()});section.addEventListener('focusout',()=>setTimeout(()=>{focused=section.contains(document.activeElement);playback()},0));document.addEventListener('visibilitychange',playback);
  if('IntersectionObserver'in window)new IntersectionObserver(entries=>{outside=!entries[0].isIntersecting;playback()},{threshold:.1}).observe(section);
  let touch=null;root.addEventListener('touchstart',e=>{if(!e.target.closest('.hero-slide'))return;touch={x:e.touches[0].clientX,y:e.touches[0].clientY}},{passive:true});root.addEventListener('touchend',e=>{if(!touch)return;const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;touch=null;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)*1.4){e.preventDefault();suppressUntil=Date.now()+450;show(index+(dx>0?1:-1))}},{passive:false});
  root.addEventListener('click',e=>{const slide=e.target.closest('.hero-slide');if(!slide)return;if(Date.now()<suppressUntil){e.preventDefault();e.stopImmediatePropagation();return}if(!slide.classList.contains('is-active')){e.preventDefault();e.stopImmediatePropagation();show(Number(slide.dataset.photo))}},true);
  reduced.addEventListener('change',e=>{if(e.matches){userPaused=true;playback()}});show(0,false);playback();
  return{setModalOpen(value){modal=value;playback()},get current(){return index}};
}
