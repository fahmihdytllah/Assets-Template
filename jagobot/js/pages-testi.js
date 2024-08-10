
$(function (){
  const swiper3dCubeEffect = document.querySelector('#swiper-3d-cube-effect');
  
  // 3D cube effect
  // --------------------------------------------------------------------
  if (swiper3dCubeEffect) {
    new Swiper(swiper3dCubeEffect, {
      effect: 'cube',
      grabCursor: true,
      cubeEffect: {
        shadow: true,
        slideShadows: true,
        shadowScale: 0.94,
        shadowOffset: 20
      },
      pagination: {
        el: '.swiper-pagination'
      }
    });
  }
});