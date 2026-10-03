/* ============================================================
   涂色素材与色彩数据
   ============================================================ */

/* 基础调色盘（蜡笔色） */
const PALETTE = [
  { c: '#FF4B4B', n: '大红' }, { c: '#FF9F1C', n: '橙色' }, { c: '#FFD500', n: '金黄' },
  { c: '#F7B500', n: '橘黄' }, { c: '#2ECC40', n: '翠绿' }, { c: '#7ED321', n: '草绿' },
  { c: '#1ABC9C', n: '青绿' }, { c: '#3498DB', n: '天蓝' }, { c: '#86C5FF', n: '浅蓝' },
  { c: '#2C3E50', n: '深蓝' }, { c: '#9B59B6', n: '紫色' }, { c: '#B786F5', n: '浅紫' },
  { c: '#FF8AD8', n: '粉色' }, { c: '#E91E63', n: '玫红' }, { c: '#FFDFC4', n: '肤色' },
  { c: '#8B5A2B', n: '棕色' }, { c: '#374151', n: '黑色' }, { c: '#9CA3AF', n: '灰色' },
  { c: '#FFFFFF', n: '白色' }, { c: '#0EA5E9', n: '亮蓝' }
];

/* 自由绘画印章 */
const STAMPS = ['⭐', '❤️', '🐟', '🌸', '🌈', '☀️', '🦋', '🌟', '🍉', '🐱'];

/* 画纸颜色 */
const PAPERS = [
  { c: '#FFFFFF', n: '白纸' }, { c: '#FFF6E0', n: '米纸' },
  { c: '#FFE9F1', n: '粉纸' }, { c: '#E8F4FF', n: '蓝纸' }
];

/* 调色实验室的基础色 */
const MIX_BASE = [
  { c: '#FF4B4B', n: '红' }, { c: '#FF9F1C', n: '橙' }, { c: '#FFD500', n: '黄' },
  { c: '#2ECC40', n: '绿' }, { c: '#1ABC9C', n: '青' }, { c: '#3498DB', n: '蓝' },
  { c: '#2C3E50', n: '深蓝' }, { c: '#9B59B6', n: '紫' }, { c: '#FF8AD8', n: '粉' },
  { c: '#E91E63', n: '玫红' }, { c: '#8B5A2B', n: '棕' }, { c: '#86C5FF', n: '浅蓝' }
];

/* 冷暖色：用于"冷还是暖"小游戏 */
const WARM_COLORS = ['#FF4B4B', '#FF9F1C', '#FFD500', '#F7B500', '#FF8AD8', '#E91E63', '#8B5A2B', '#FFDFC4'];
const COOL_COLORS = ['#2ECC40', '#1ABC9C', '#3498DB', '#86C5FF', '#2C3E50', '#9B59B6', '#B786F5', '#0EA5E9'];

/* 互补色（好朋友）对：用于"找好朋友"小游戏 */
const COMP_PAIRS = [
  { a: '#FF4B4B', b: '#2ECC40' },   // 红 ↔ 绿
  { a: '#FF9F1C', b: '#3498DB' },   // 橙 ↔ 蓝
  { a: '#FFD500', b: '#9B59B6' },   // 黄 ↔ 紫
  { a: '#E91E63', b: '#1ABC9C' },   // 玫红 ↔ 青
  { a: '#F7B500', b: '#2C3E50' },   // 橘黄 ↔ 深蓝
  { a: '#FF8AD8', b: '#7ED321' }    // 粉 ↔ 草绿
];

/* 涂色线稿页（原创 SVG，支持直接序列化成图片） */
const COLORING_PAGES = [
/* ---------- 快乐小鱼 ---------- */
{
  id: 'fish', name: '快乐小鱼', emoji: '🐠',
  svg: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect class="region" data-name="海水" x="0" y="0" width="800" height="600" fill="#ffffff"/>
  <path class="region" data-name="尾巴" d="M235 300 L112 202 L148 300 L112 398 Z"/>
  <path class="region" data-name="鱼身" d="M230 300 C230 210 380 168 480 232 C552 278 562 362 470 418 C388 462 230 390 230 300 Z"/>
  <path class="region" data-name="背鳍" d="M386 190 C408 92 476 102 490 186 Z"/>
  <path class="region" data-name="腹鳍" d="M348 402 C332 472 262 456 262 406 Z"/>
  <circle class="region" data-name="鱼眼" cx="252" cy="270" r="24"/>
  <circle class="region" data-name="眼珠" cx="256" cy="270" r="9"/>
  <path class="sn" d="M274 330 C292 348 324 348 340 330"/>
  <circle class="region" data-name="泡泡" cx="618" cy="196" r="18"/>
  <circle class="region" data-name="泡泡" cx="658" cy="132" r="24"/>
  <circle class="region" data-name="泡泡" cx="580" cy="252" r="12"/>
  <path class="sn" d="M700 560 C688 502 716 472 698 418"/>
  <path class="sn" d="M724 560 C714 512 738 486 724 440"/>
</svg>`
},
/* ---------- 可爱小猫 ---------- */
{
  id: 'cat', name: '可爱小猫', emoji: '🐱',
  svg: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect class="region" data-name="天空" x="0" y="0" width="800" height="370" fill="#ffffff"/>
  <rect class="region" data-name="草地" x="0" y="370" width="800" height="230" fill="#ffffff"/>
  <path class="region" data-name="左耳" d="M300 150 L258 20 L372 112 Z"/>
  <path class="region" data-name="右耳" d="M500 150 L542 20 L428 112 Z"/>
  <path class="region" data-name="身体" d="M262 402 C248 530 288 562 318 562 L498 562 C528 562 552 530 538 402 C518 330 292 330 262 402 Z"/>
  <path class="region" data-name="尾巴" d="M533 452 C636 444 662 366 612 322 C580 300 556 330 584 362 C610 390 590 448 546 458 Z"/>
  <ellipse class="region" data-name="肚皮" cx="400" cy="478" rx="96" ry="66"/>
  <path class="region" data-name="蝴蝶结左" d="M400 422 L350 396 L350 448 Z"/>
  <path class="region" data-name="蝴蝶结右" d="M400 422 L450 396 L450 448 Z"/>
  <circle class="region" data-name="蝴蝶结心" cx="400" cy="422" r="13"/>
  <circle class="region" data-name="头" cx="400" cy="240" r="140"/>
  <path class="region" data-name="左内耳" d="M292 118 L278 52 L340 108 Z"/>
  <path class="region" data-name="右内耳" d="M508 118 L522 52 L460 108 Z"/>
  <ellipse class="region" data-name="左眼" cx="342" cy="232" rx="30" ry="34"/>
  <ellipse class="region" data-name="右眼" cx="458" cy="232" rx="30" ry="34"/>
  <circle class="region" data-name="左瞳孔" cx="346" cy="234" r="9"/>
  <circle class="region" data-name="右瞳孔" cx="462" cy="234" r="9"/>
  <path class="region" data-name="鼻子" d="M384 312 L416 312 L400 338 Z"/>
  <path class="sn" d="M400 338 C388 358 368 356 366 336"/>
  <path class="sn" d="M400 338 C412 358 432 356 434 336"/>
  <path class="sn" d="M332 314 L224 302 M332 328 L220 334 M468 314 L576 302 M468 328 L580 334"/>
  <path class="sn" d="M252 262 a20 20 0 1 1 -22 -8 M548 262 a20 20 0 1 0 -22 -8"/>
</svg>`
},
/* ---------- 五彩花朵 ---------- */
{
  id: 'flower', name: '五彩花朵', emoji: '🌸',
  svg: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect class="region" data-name="天空" x="0" y="0" width="800" height="600" fill="#ffffff"/>
  <path class="region" data-name="花茎" d="M382 330 C382 430 352 448 352 526 L418 526 C418 448 418 430 418 330 Z"/>
  <path class="region" data-name="叶子左" d="M372 448 C290 396 214 436 246 492 C278 548 348 502 386 462 Z"/>
  <path class="region" data-name="叶子右" d="M410 400 C494 352 568 388 534 444 C500 500 434 452 396 424 Z"/>
  <ellipse class="region" data-name="花瓣" cx="400" cy="170" rx="72" ry="95" transform="rotate(0 400 265)"/>
  <ellipse class="region" data-name="花瓣" cx="400" cy="170" rx="72" ry="95" transform="rotate(60 400 265)"/>
  <ellipse class="region" data-name="花瓣" cx="400" cy="170" rx="72" ry="95" transform="rotate(120 400 265)"/>
  <ellipse class="region" data-name="花瓣" cx="400" cy="170" rx="72" ry="95" transform="rotate(180 400 265)"/>
  <ellipse class="region" data-name="花瓣" cx="400" cy="170" rx="72" ry="95" transform="rotate(240 400 265)"/>
  <ellipse class="region" data-name="花瓣" cx="400" cy="170" rx="72" ry="95" transform="rotate(300 400 265)"/>
  <circle class="region" data-name="花心" cx="400" cy="265" r="58"/>
  <circle class="region" data-name="太阳" cx="700" cy="110" r="50"/>
  <path class="sn" d="M700 36 V 20 M700 184 V 200 M626 110 H 610 M774 110 H 790 M648 58 L 636 46 M752 162 L 764 174 M752 58 L 764 46 M648 162 L 636 174"/>
  <g class="region" data-name="云朵">
    <circle cx="150" cy="205" r="40"/><circle cx="205" cy="178" r="50"/><circle cx="262" cy="205" r="38"/><rect x="148" y="195" width="116" height="48" rx="24"/>
  </g>
  <path class="sn" d="M50 560 Q 80 534 110 560 T 170 560 T 230 560"/>
  <path class="sn" d="M300 565 Q 330 539 360 565 T 420 565 T 480 565"/>
</svg>`
},
/* ---------- 温馨小屋 ---------- */
{
  id: 'house', name: '温馨小屋', emoji: '🏠',
  svg: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect class="region" data-name="天空" x="0" y="0" width="800" height="600" fill="#ffffff"/>
  <circle class="region" data-name="太阳" cx="120" cy="110" r="52"/>
  <path class="sn" d="M120 32 V 16 M120 188 V 204 M44 110 H 28 M196 110 H 212 M66 56 L 54 44 M174 164 L 186 176 M174 56 L 186 44 M66 164 L 54 176"/>
  <g class="region" data-name="云朵">
    <circle cx="560" cy="150" r="36"/><circle cx="608" cy="126" r="46"/><circle cx="660" cy="150" r="34"/><rect x="558" y="140" width="104" height="44" rx="22"/>
  </g>
  <rect class="region" data-name="烟囱" x="474" y="150" width="52" height="130"/>
  <circle class="region" data-name="烟圈" cx="500" cy="122" r="15"/>
  <circle class="region" data-name="烟圈" cx="516" cy="92" r="19"/>
  <circle class="region" data-name="烟圈" cx="540" cy="58" r="23"/>
  <path class="region" data-name="屋顶" d="M206 332 L400 118 L594 332 Z"/>
  <rect class="region" data-name="屋身" x="238" y="322" width="324" height="208"/>
  <rect class="region" data-name="大门" x="343" y="388" width="114" height="142" rx="10"/>
  <circle class="region" data-name="门把手" cx="438" cy="462" r="8"/>
  <rect class="region" data-name="左窗户" x="264" y="348" width="84" height="84" rx="12"/>
  <rect class="region" data-name="右窗户" x="452" y="348" width="84" height="84" rx="12"/>
  <path class="sn" d="M306 348 V 432 M264 390 H 348 M494 348 V 432 M452 390 H 536"/>
  <path class="region" data-name="小路" d="M335 548 L272 600 L528 600 L465 548 Z"/>
  <rect class="region" data-name="草地" x="0" y="540" width="800" height="60" fill="#ffffff"/>
  <path class="sn" d="M40 510 V 570 M130 510 V 570 M220 510 V 570 M310 510 V 570 M490 510 V 570 M580 510 V 570 M670 510 V 570 M760 510 V 570 M40 528 H 760 M40 552 H 760"/>
</svg>`
},
/* ---------- 花间蝴蝶 ---------- */
{
  id: 'butterfly', name: '花间蝴蝶', emoji: '🦋',
  svg: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect class="region" data-name="天空" x="0" y="0" width="800" height="600" fill="#ffffff"/>
  <path class="region" data-name="左翅上" d="M372 252 C240 116 92 168 122 304 C142 384 282 354 362 314 Z"/>
  <path class="region" data-name="右翅上" d="M428 252 C560 116 708 168 678 304 C658 384 518 354 438 314 Z"/>
  <path class="region" data-name="左翅下" d="M362 332 C300 388 250 470 312 502 C356 524 382 448 382 388 Z"/>
  <path class="region" data-name="右翅下" d="M438 332 C500 388 550 470 488 502 C444 524 418 448 418 388 Z"/>
  <circle class="region" data-name="翅膀花纹" cx="200" cy="238" r="24"/>
  <circle class="region" data-name="翅膀花纹" cx="256" cy="300" r="19"/>
  <circle class="region" data-name="翅膀花纹" cx="170" cy="292" r="13"/>
  <circle class="region" data-name="翅膀花纹" cx="600" cy="238" r="24"/>
  <circle class="region" data-name="翅膀花纹" cx="544" cy="300" r="19"/>
  <circle class="region" data-name="翅膀花纹" cx="630" cy="292" r="13"/>
  <circle class="region" data-name="翅膀花纹" cx="318" cy="436" r="16"/>
  <circle class="region" data-name="翅膀花纹" cx="482" cy="436" r="16"/>
  <ellipse class="region" data-name="身体" cx="400" cy="330" rx="26" ry="96"/>
  <circle class="region" data-name="头" cx="400" cy="206" r="36"/>
  <path class="sn" d="M388 182 C368 140 360 118 332 108 M412 182 C432 140 440 118 468 108"/>
  <circle class="region" data-name="触角" cx="332" cy="108" r="8"/>
  <circle class="region" data-name="触角" cx="468" cy="108" r="8"/>
</svg>`
},
/* ---------- 小恐龙 ---------- */
{
  id: 'dino', name: '小恐龙', emoji: '🦕',
  svg: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect class="region" data-name="大地" x="0" y="0" width="800" height="600" fill="#ffffff"/>
  <circle class="region" data-name="太阳" cx="120" cy="110" r="48"/>
  <path class="sn" d="M120 38 V 22 M120 182 V 198 M48 110 H 32 M192 110 H 208 M69 59 L 57 47 M171 161 L 183 173 M171 59 L 183 47 M69 161 L 57 173"/>
  <path class="region" data-name="尾巴" d="M255 400 C128 382 108 462 166 482 C222 502 282 470 302 440 Z"/>
  <path class="region" data-name="后腿" d="M330 462 C322 560 352 578 380 578 C406 578 420 558 412 472 Z"/>
  <path class="region" data-name="前腿" d="M452 472 C448 566 478 584 504 584 C530 584 542 560 530 480 Z"/>
  <ellipse class="region" data-name="身体" cx="400" cy="380" rx="150" ry="110"/>
  <circle class="region" data-name="头" cx="620" cy="272" r="95"/>
  <ellipse class="region" data-name="嘴巴" cx="696" cy="302" rx="60" ry="48"/>
  <ellipse class="region" data-name="肚皮" cx="415" cy="430" rx="95" ry="62"/>
  <path class="region" data-name="背甲" d="M332 300 L320 222 L378 292 Z"/>
  <path class="region" data-name="背甲" d="M388 286 L388 202 L438 280 Z"/>
  <path class="region" data-name="背甲" d="M448 278 L458 198 L498 274 Z"/>
  <path class="region" data-name="背甲" d="M508 274 L532 214 L552 276 Z"/>
  <path class="region" data-name="背甲" d="M560 268 L574 180 L598 262 Z"/>
  <circle class="region" data-name="眼睛" cx="652" cy="252" r="18"/>
  <circle class="region" data-name="瞳孔" cx="657" cy="252" r="7"/>
  <circle class="region" data-name="鼻孔" cx="714" cy="288" r="8"/>
  <path class="sn" d="M700 330 C722 350 744 342 752 322"/>
  <circle class="region" data-name="脚趾" cx="352" cy="566" r="9"/>
  <circle class="region" data-name="脚趾" cx="372" cy="572" r="9"/>
  <circle class="region" data-name="脚趾" cx="392" cy="568" r="9"/>
  <circle class="region" data-name="脚趾" cx="476" cy="572" r="9"/>
  <circle class="region" data-name="脚趾" cx="496" cy="576" r="9"/>
  <circle class="region" data-name="脚趾" cx="516" cy="570" r="9"/>
</svg>`
},
/* ---------- 大西瓜 ---------- */
{
  id: 'melon', name: '大西瓜', emoji: '🍉',
  svg: `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <rect class="region" data-name="天空" x="0" y="0" width="800" height="600" fill="#ffffff"/>
  <circle class="region" data-name="太阳" cx="130" cy="110" r="46"/>
  <path class="sn" d="M130 40 V 24 M130 180 V 196 M60 110 H 44 M200 110 H 216 M81 61 L 69 49 M181 159 L 193 171 M181 61 L 193 49 M81 159 L 69 171"/>
  <g class="region" data-name="云朵">
    <circle cx="600" cy="150" r="34"/><circle cx="646" cy="128" r="44"/><circle cx="696" cy="150" r="32"/><rect x="598" y="140" width="100" height="42" rx="21"/>
  </g>
  <rect class="region" data-name="草地" x="0" y="548" width="800" height="52" fill="#ffffff"/>
  <circle class="region" data-name="西瓜皮" cx="400" cy="330" r="288"/>
  <circle class="region" data-name="瓜瓤" cx="400" cy="330" r="240"/>
  <ellipse class="region" data-name="西瓜籽" cx="326" cy="298" rx="11" ry="17" transform="rotate(-22 326 298)"/>
  <ellipse class="region" data-name="西瓜籽" cx="392" cy="230" rx="10" ry="15" transform="rotate(8 392 230)"/>
  <ellipse class="region" data-name="西瓜籽" cx="468" cy="296" rx="11" ry="17" transform="rotate(22 468 296)"/>
  <ellipse class="region" data-name="西瓜籽" cx="348" cy="418" rx="10" ry="15" transform="rotate(-10 348 418)"/>
  <ellipse class="region" data-name="西瓜籽" cx="428" cy="412" rx="11" ry="17" transform="rotate(14 428 412)"/>
  <ellipse class="region" data-name="西瓜籽" cx="502" cy="372" rx="10" ry="15" transform="rotate(30 502 372)"/>
  <ellipse class="region" data-name="西瓜籽" cx="292" cy="368" rx="9" ry="13" transform="rotate(-34 292 368)"/>
  <ellipse class="region" data-name="西瓜籽" cx="368" cy="330" rx="9" ry="14" transform="rotate(0 368 330)"/>
</svg>`
}
];

/* 首页配色小贴士 */
const COLOR_TIPS = [
  '天空不一定是蓝色的，也可以是粉色的哦！',
  '草不一定是绿色的，试试紫色草地吧！',
  '红色和绿色是好朋友，搭配起来很热闹！',
  '暖色像太阳，冷色像海水，混着用最有趣～',
  '画完记得点保存，星星就会飞向你的钱包！',
  '调色实验室里，两种颜色会变出第三种！',
  '每幅画都值得被收藏，你的画廊会越来越棒！'
];