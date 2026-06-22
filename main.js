/* =============================================================
   main.js
   포트폴리오 인터랙션 스크립트
   ─ 구조:
     0. GSAP 플러그인 등록
     1. 커스텀 커서
     2. INTRO 애니메이션 (단일 슬롯 단어 교체)
     3. MAIN 섹션 (타이틀 플립 + 이름/중앙 이미지 페이드인)  ← 핀/수렴 제거
     4. ABOUT 섹션 (가로 슬라이드 · containerAnimation)
     5. PROJECTS 섹션 (카드 트랙 · 단일 타임라인 패럴랙스)
     6. CONTACT 섹션 (마퀴 · 자석 · 페이드인)
   ============================================================= */


/* ─────────────────────────────────────────────
   0. GSAP ScrollTrigger 플러그인 등록
   ───────────────────────────────────────────── */
gsap.registerPlugin(ScrollTrigger);


/* =============================================================
   1. 커스텀 마우스 커서
   ============================================================= */
(function initCursor() {
   if (window.matchMedia('(hover: none), (pointer: coarse)').matches) return;
  const cursor   = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  let mouseX = 0, mouseY = 0;
  let followerX = 0, followerY = 0;

  document.addEventListener('mousemove', e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    gsap.to(cursor, { x: mouseX, y: mouseY, duration: 0.06 });
  });

  (function followerLoop() {
    followerX += (mouseX - followerX) * 0.12;
    followerY += (mouseY - followerY) * 0.12;
    gsap.set(follower, { x: followerX, y: followerY });
    requestAnimationFrame(followerLoop);
  })();

  /* 링크/버튼/자석 요소 진입 시 커서 확대.
     동적 생성되는 글자(.letter-flip)까지 잡으려고 이벤트 위임 사용 */
  const isInteractive = el =>
    el.closest && el.closest('a, button, [data-magnetic], .letter-flip');

  document.addEventListener('mouseover', e => {
    if (isInteractive(e.target)) {
      gsap.to(cursor,   { scale: 2.4, duration: 0.3 });
      gsap.to(follower, { scale: 1.4, opacity: 0.4, backgroundColor: 'rgba(154, 0, 2, 0.12)', duration: 0.3 });
    }
  });
  document.addEventListener('mouseout', e => {
    if (isInteractive(e.target)) {
      gsap.to(cursor,   { scale: 1, duration: 0.3 });
      gsap.to(follower, { scale: 1, opacity: 0.7, backgroundColor: 'rgba(154, 0, 2, 0)', duration: 0.3 });
    }
  });
})();


/* =============================================================
   2. INTRO 섹션 애니메이션 (단일 슬롯 단어 교체)
   ============================================================= */
(function initIntro() {

  const WORDS = [
    "JEONGYEON'S",
    "PORTFOLIO."
  ];

  const wordEl = document.getElementById('introWord');
  let currentIndex = 0;

  function showWord(index) {
    const word   = WORDS[index];
    const isLast = (index === WORDS.length - 1);

    wordEl.textContent = word;
    gsap.set(wordEl, { y: '110%', opacity: 1 });

    const tl = gsap.timeline({
      onComplete: () => {
        if (!isLast) {
          currentIndex++;
          showWord(currentIndex);
        } else {
          exitIntro();
        }
      }
    });

    tl.to(wordEl, { y: '0%', duration: 0.65, ease: 'power4.out' });

    if (!isLast) {
      tl.to(wordEl, { y: '-110%', duration: 0.5, ease: 'power3.in', delay: 0.45 });
    } else {
      tl.to(wordEl, { opacity: 0, y: '-24px', duration: 0.55, ease: 'power2.in', delay: 0.7 });
    }
  }

  /* 인트로 레이어 퇴장 → 메인 히어로 시작 */
  function exitIntro() {
    gsap.to('#intro', {
      yPercent:  -105,
      duration:  1.1,
      ease:      'power3.inOut',
      onComplete: () => {
        document.getElementById('intro').style.display = 'none';
        initMain();   /* 인트로 종료 후 메인 + 스크롤 섹션 초기화 */
      }
    });
  }

  showWord(0);
})();


/* =============================================================
   3. MAIN 섹션 — 히어로 리빌 (핀/수렴 제거)
      ① CREATIVE PUBLISHER → 글자 단위 플립 구조 생성
      ② 등장 타임라인 (글자 플립 → 타이틀 상승 → 이름 페이드인 → 중앙 이미지 슬라이드업)
      ③ 각 글자 hover 플립
      ④ 스크롤 섹션 초기화 + ScrollTrigger.refresh()
   ============================================================= */
function initMain() {

  /* ① 글자 단위 HTML 구조 자동 생성 */
  const titleEl  = document.getElementById('mainTitle');
  const fullText = 'CREATIVE PUBLISHER';
  let innerHTML  = '';

  for (let i = 0; i < fullText.length; i++) {
    const ch = fullText[i];
    if (ch === ' ') {
      innerHTML += '<span class="letter-space" aria-hidden="true"> </span>';
    } else {
      innerHTML += `
        <span class="letter-flip" aria-hidden="true">
          <span class="letter-flip-inner" style="transform: translateY(100%);">
            <span class="char-default">${ch}</span>
            <span class="char-hover">${ch}</span>
          </span>
        </span>`;
    }
  }

  titleEl.innerHTML = innerHTML;
  titleEl.setAttribute('aria-label', fullText);

  /* ② 등장 타임라인: 글자 플립 → 타이틀 상승 → 이름 페이드인 → 중앙 이미지 슬라이드업 */
  const flipInners = document.querySelectorAll('.letter-flip-inner');

  /* 중앙 이미지: 수평 정중앙(translateX -50%)을 xPercent로 고정 →
     이후 y/opacity 애니메이션과 트랜스폼이 충돌하지 않도록 분리 */
  gsap.set('#centerImage', { xPercent: -50 });

  const mainTl = gsap.timeline();
  mainTl
    .to(flipInners, { y: '0%', duration: 0.58, ease: 'back.out(2)', stagger: 0.038 })
    .to('#mainTitleWrap', { top: '0%', yPercent: 0, y: 0, duration: 0.88, ease: 'power3.inOut', delay: 0.3 })
    /* 좌·우 이름 페이드인 (살짝 스태거) */
    .fromTo(['#nameLeft', '#nameRight'],
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.12 },
      '-=0.7')
    /* 중앙 이미지: 밑에서 위로 '뿅~' 슬라이드업 + 페이드인 (xPercent:-50 유지) */
    .fromTo('#centerImage',
      { opacity: 0, y: 90 },
      { opacity: 1, y: 0, duration: 0.95, ease: 'back.out(1.5)' },
      '-=0.45');

  /* ③ 글자 플립 hover */
  document.querySelectorAll('.letter-flip').forEach(flipEl => {
    const inner = flipEl.querySelector('.letter-flip-inner');
    flipEl.addEventListener('mouseenter', () => {
      gsap.to(inner, { y: '-50%', duration: 0.28, ease: 'power3.out' });
    });
    flipEl.addEventListener('mouseleave', () => {
      gsap.to(inner, { y: '0%', duration: 0.28, ease: 'power3.out' });
    });
  });

  /* ④ 스크롤 섹션 초기화 (DOM 순서대로 → 핀 스페이서 계산 안정) */
  initAbout();
  initProjects();
  initContact();

  /* 모든 트리거 생성 후 위치 재계산 */
  ScrollTrigger.refresh();
}


/* =============================================================
   유틸: containerAnimation(가로 스크롤) 위에서 콘텐츠 등장
   - CSS 초기 상태(opacity:0)에 의존하지 않도록 fromTo 사용
   ============================================================= */
function revealInTrack(target, yFrom, containerAnim, start, delay = 0) {
  gsap.fromTo(target,
    { opacity: 0, y: yFrom },
    {
      opacity: 1, y: 0, duration: 0.8, delay, ease: 'power3.out',
      scrollTrigger: {
        trigger:           target,
        containerAnimation: containerAnim,
        start:             start,
        toggleActions:     'play none none reverse'
      }
    });
}


/* =============================================================
   4. ABOUT 섹션 — 가로 슬라이드 (3패널)
      트랙 이동을 "컨테이너 애니메이션"으로 삼아,
      각 패널 콘텐츠를 containerAnimation 트리거로 등장.
      → 핀/진행도를 단일 트리거로 통일 (이중 트리거 제거)
   ============================================================= */
function initAbout() {
  const track = document.getElementById('aboutTrack');
  const getTotalMove = () => track.scrollWidth - window.innerWidth;

  /* ── 마스터 타임라인 (containerAnimation으로 사용) ──
     ① 데코 순차 등장 → tl 먼저 스르륵, 이어서 br (가로 이동 전 초반 구간)
     ② 트랙 가로 이동 (반드시 ease:'none')
     · end 를 가로 이동 거리보다 약 1.33배로 잡아, 앞쪽 1/4 구간을
       데코 등장에 할당하고 나머지 구간에서 트랙이 좌측으로 이동(다음 패널 노출) */
  const aboutScroll = gsap.timeline({
    scrollTrigger: {
      trigger:            '#about',
      start:              'top top',
      end:                () => '+=' + getTotalMove() * 1.33,
      pin:                true,
      scrub:              1,
      anticipatePin:      1,
      invalidateOnRefresh: true
    }
  });

  aboutScroll
    /* ① 왼쪽 상단 데코 — 좌상단에서 스르륵 슬라이드 + 페이드인 */
    .fromTo('.about-p1-deco--tl',
      { opacity: 0, x: -60, y: -60, scale: 0.7, rotation: -15 },
      { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, duration: 0.5, ease: 'power3.out' })
    /* ② 오른쪽 하단 데코 — tl 직후 이어서 등장 (살짝 겹쳐 순차감) */
    .fromTo('.about-p1-deco--br',
      { opacity: 0, x: 60, y: 60, scale: 0.7, rotation: 15 },
      { opacity: 1, x: 0, y: 0, scale: 1, rotation: 0, duration: 0.5, ease: 'power3.out' },
      '>-0.12')
    /* ③ 데코 감상용 짧은 정지 구간 */
    .to({}, { duration: 0.25 })
    /* ④ 트랙 가로 이동 — containerAnimation 매핑을 위해 ease:'none' 필수 */
    .to(track, { x: () => -getTotalMove(), ease: 'none', duration: 3.4 });

  /* 패널 2 — Design Translator */
  revealInTrack('#p2Kicker',   30, aboutScroll, 'left 65%');
  revealInTrack('#p2Headline', 50, aboutScroll, 'left 65%');
  revealInTrack('#p2Desc',     30, aboutScroll, 'left 60%');

  /* 패널 3 — 기술 스택
     · 박스를 개별로 등장시키면, 가로 스크롤(overflow) 안쪽에 밀려 있는
       3~5번째 박스는 등장 트리거가 발동되지 않아 숨겨졌었음.
     · 따라서 #skillList 컨테이너 '전체'를 한 번에 등장시켜
       모든 박스가 동시에 노출되도록 변경 (가로 스와이프 시 모두 보임) */
  revealInTrack('#p3Title',   40, aboutScroll, 'left 65%');
  revealInTrack('#skillList', 30, aboutScroll, 'left 72%');
}


/* =============================================================
   5. PROJECTS 섹션 — 가로 카드 트랙 (단일 타임라인 패럴랙스)
      카드 트랙 + 배경 타이틀을 같은 타임라인 position 0에 배치
      → 동일 진행도 → 패럴랙스 덜컹임 제거
   ============================================================= */
function initProjects() {
  const track   = document.getElementById('cardsTrack');
  const bgTitle = document.getElementById('projectsBgTitle');

  const getTotalMove = () =>
    track.scrollWidth - window.innerWidth + window.innerWidth * 0.12;

  const tl = gsap.timeline({
    scrollTrigger: {
      trigger:           '#projects',
      start:             'top top',
      end:               () => '+=' + getTotalMove(),
      pin:               true,
      scrub:             1,
      anticipatePin:     1,
      invalidateOnRefresh: true
    }
  });

  tl.to(track,   { x: () => -getTotalMove(),        ease: 'none' }, 0)
    .to(bgTitle, { x: () => -getTotalMove() * 0.35, ease: 'none' }, 0);
}


/* =============================================================
   6. CONTACT 섹션 — 마퀴 · 페이드인 · 자석
   ============================================================= */
function initContact() {

  /* ① 무한 마퀴 — 순수 CSS @keyframes 로 처리 (JS transform 갱신 제거) */
  /*    seamless 반복 + will-change 최적화는 style.css 의 .marquee-track 참고 */

  /* ② contact-headline — 줄 단위 좌/우 슬라이드 등장 (IntersectionObserver로 .is-visible 부여) */
  const headline = document.getElementById('contactHeadline');
  if (headline) {
    const headlineObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);   // 한 번만 트리거
        }
      });
    }, { threshold: 0.25 });
    headlineObserver.observe(headline);
  }

  /* ③ 나머지 콘텐츠 순차 페이드인 (divider · email) */
  gsap.to('#contactDivider', {
    opacity: 1, duration: 0.6,
    scrollTrigger: { trigger: '#contact', start: 'top 65%', toggleActions: 'play none none reverse' }
  });
  gsap.to('#emailLink', {
    opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: '#contact', start: 'top 60%', toggleActions: 'play none none reverse' }
  });
  gsap.to('#socialList li', {
    opacity: 1, y: 0, stagger: 0.12, duration: 0.7, ease: 'power3.out',
    scrollTrigger: { trigger: '#contact', start: 'top 55%', toggleActions: 'play none none reverse' }
  });

  /* ④ 자석(Magnetic) 호버 */
  document.querySelectorAll('[data-magnetic]').forEach(el => {
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width  / 2;
      const centerY = rect.top  + rect.height / 2;
      const dx = (e.clientX - centerX) * 0.28;
      const dy = (e.clientY - centerY) * 0.28;
      gsap.to(el, { x: dx, y: dy, duration: 0.35, ease: 'power2.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.55, ease: 'elastic.out(1, 0.4)' });
    });
  });
}


/* =============================================================
   모바일(터치) 전용 — 스크롤 시 중앙 이미지 교체
   - 터치 기기엔 hover가 없으므로, 스크롤하면 .img-swapped 클래스를
     부여/제거하여 hover와 동일한 교차 페이드로 두 번째 이미지 노출
   - (max-width:768px)에서만 동작, 데스크탑은 기존 hover 그대로
   - 최상단으로 돌아오면 원래 이미지로 복원
   ============================================================= */
(function initMobileImageSwap() {
  const img = document.getElementById('centerImage');
  if (!img) return;

  const mq = window.matchMedia('(max-width: 768px)');
  let bound = false;

  /* 살짝만 스크롤해도 두 번째 이미지로 전환, 최상단이면 원복 */
  const onScroll = () => {
    if (window.scrollY > 40) img.classList.add('img-swapped');
    else                     img.classList.remove('img-swapped');
  };

  /* 화면 폭에 따라 스크롤 리스너 연결/해제 */
  const apply = () => {
    if (mq.matches) {
      if (!bound) {
        window.addEventListener('scroll', onScroll, { passive: true });
        bound = true;
      }
      onScroll();                       /* 현재 스크롤 위치 즉시 반영 */
    } else {
      if (bound) {
        window.removeEventListener('scroll', onScroll);
        bound = false;
      }
      img.classList.remove('img-swapped'); /* 데스크탑은 hover만 사용 */
    }
  };

  apply();
  mq.addEventListener('change', apply);   /* 리사이즈/회전 시 재평가 */
})();


/* =============================================================
   스킬 박스 가로 스와이프 힌트
   - 사용자가 #skillList를 가로로 한 번이라도 스와이프하면 힌트 페이드아웃
   ============================================================= */
(function initSwipeHint() {
  const list = document.getElementById('skillList');
  const hint = document.getElementById('skillSwipeHint');
  if (!list || !hint) return;

  const onScroll = () => {
    if (list.scrollLeft > 8) {                 /* 살짝만 밀어도 숨김 */
      hint.classList.add('is-hidden');
      list.removeEventListener('scroll', onScroll);
    }
  };
  list.addEventListener('scroll', onScroll, { passive: true });
})();


/* =============================================================
   창 리사이즈 시 ScrollTrigger 전체 갱신
   ============================================================= */
window.addEventListener('resize', () => {
  ScrollTrigger.refresh();
}, { passive: true });
