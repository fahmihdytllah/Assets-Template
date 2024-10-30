/**
 * Star Ratings (jquery)
 */

'use strict';

$(function () {
  let fullStar = $('.ratings'),
    formReview = $('.form-review');

  if (fullStar) {
    fullStar.rateYo({
      rtl: isRtl,
      spacing: '8px',

      rating: 0,
    });
  }

  if (fullStar) {
    fullStar
      .rateYo({
        rtl: isRtl,
        spacing: '8px',
      })
      .on('rateyo.change', function (e, data) {
        var rating = data.rating;
        $('#rating').val(rating);
      });
  }

  formReview.submit(function (e) {
    e.preventDefault();

    formReview.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '?',
      type: 'POST',
      data: $(this).serialize(),
      success: function (res) {
        formReview.unblock();
        toastr.success(res.msg, 'Good Job!');
      },
      error: function (err) {
        formReview.unblock();
        let msg = err.responseJSON?.msg;
        toastr.error(msg ? msg : 'There is an error!', 'Opss!');
      },
    });
  });
});
