$(function () {
  const formTools = $('#formTools'),
    maxlengthInput = $('.text-maxlength');

  if (maxlengthInput.length) {
    maxlengthInput.each(function () {
      $(this).maxlength({
        warningClass: 'label label-success bg-success text-white',
        limitReachedClass: 'label label-danger',
        separator: ' out of ',
        preText: 'You typed ',
        postText: ' chars available.',
        validate: true,
        threshold: +this.getAttribute('maxlength'),
      });
    });
  }

  formTools.submit(function (e) {
    e.preventDefault();

    formTools.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', color: '#fff', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      data: $(this).serialize(),
      url: '?',
      type: 'POST',
      success: function (res) {
        formTools.unblock();
        loadData(res);
        $('#result').show();
        Swal.fire({
          title: 'Good job!',
          text: 'Successfully checked text plagiarism',
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary' },
          buttonsStyling: !1,
        });
      },
      error: function (e) {
        formTools.unblock();
        const msg = e.responseJSON.msg;
        Swal.fire({
          title: 'Upss!',
          text: msg ? msg : 'There is an error!',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary' },
          buttonsStyling: !1,
        });
      },
    });
  });

  function loadData(data) {
    $('#listPlagiarism').html('');
    $('.totalUnique, .totalPlagiarism, .totalWords, .totalFounds').html('0%');

    $('.totalUnique').html(data.totalUnique + '%');
    $('.totalPlagiarism').html(data.totalPlagiarism + '%');
    $('.totalWords').html(data.totalWords);
    $('.totalFounds').html(data.totalFounds);

    data.listFounds.forEach((item, index) => {
      $('#listPlagiarism').append(`<div class="card accordion-item active">
        <h2 class="accordion-header">
          <button type="button" class="accordion-button" data-bs-toggle="collapse" data-bs-target="#accord-${index}" aria-expanded="true">
            <span class="badge rounded-pill bg-label-danger me-1">${item.similarity.toFixed(0)}%</span> ${item.title}
          </button>
        </h2>

        <div id="accord-${index}" class="accordion-collapse collapse show">
          <div class="accordion-body">${item.description} <br><a href="${item.link}">Read more</a> </div>
        </div>
      </div>`);
    });
  }
});
