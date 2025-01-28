$(function () {
  const formTools = $('#formTools'),
    clipboardList = [].slice.call(document.querySelectorAll('.clipboard-btn'));

  let dataArticles = [],
    dataImages = [];

  const fullToolbar = [
    [{ font: [] }, { size: [] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ script: 'super' }, { script: 'sub' }],
    [{ header: '1' }, { header: '2' }, 'blockquote', 'code-block'],
    [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
    [{ direction: 'rtl' }],
    ['link', 'image', 'video', 'formula'],
    ['clean'],
  ];

  let editor = new Quill('#full-editor', {
    bounds: '#full-editor',
    placeholder: 'Type Something...',
    modules: {
      toolbar: fullToolbar,
    },
    theme: 'snow',
  });

  if (ClipboardJS) {
    clipboardList.map(function (clipboardEl) {
      const clipboard = new ClipboardJS(clipboardEl);
      clipboard.on('success', function (e) {
        if (e.action == 'copy') {
          Swal.fire({
            text: 'Copied to Clipboard!!',
            icon: 'success',
            customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          });
        }
      });
    });
  } else {
    clipboardList.map(function (clipboardEl) {
      clipboardEl.setAttribute('disabled', true);
    });
  }

  $('#changeView').on('change', function () {
    if (this.value === 'html') {
      $('#resultContent').hide();
      $('#resultContentHTML').show();
      $('#resultContentHTML').val(editor.root.innerHTML);
    } else {
      $('#resultContent').show();
      $('#resultContentHTML').hide();
      editor.clipboard.dangerouslyPasteHTML($('#resultContentHTML').val());
    }
  });

  $('#type').change(function () {
    let type = $(this).val();
    if (type === 'article') {
      $('#searchArticle').show();
      $('#searchImage').hide();
    } else {
      $('#searchArticle').hide();
      $('#searchImage').show();
    }
  });

  $(document).on('click', '.btn-show', function () {
    let type = $(this).data('type'),
      id = $(this).data('id');

    if (type === 'article') {
      showContent(dataArticles[id], type);
    } else {
      showContent(dataImages[id], type);
    }
  });

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
        if (res.type === 'image') {
          dataImages = res.data;
          loadImages(dataImages);
        } else {
          dataArticles = res.data;
          loadArticles(dataArticles);
        }

        Swal.fire({
          title: 'Good News!',
          text: 'Successfully search content',
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
      error: function (e) {
        formTools.unblock();
        const msg = e.responseJSON?.msg || 'There is an error!';

        Swal.fire({
          title: 'Bad News!',
          text: msg,
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
    });
  });

  function loadArticles(data) {
    $('#resultSearch').show();
    $('#listSearchs').html('');
    data.forEach((item, index) => {
      $('#listSearchs').append(`
      <li class="list-group-item list-group-item-action cursor-pointer btn-show" data-type="article" data-id="${index}">
        ${item.title}
      </li>`);
    });
  }

  function loadImages(data) {
    $('#resultSearch').show();
    $('#listSearchs').html('');
    data.forEach((item, index) => {
      $('#listSearchs').append(`
      <li class="list-group-item list-group-item-action d-flex align-items-center cursor-pointer btn-show" data-type="image" data-id="${index}">
        <img src="${item.src.small}" alt="${item.title}" class="rounded me-3 w-px-50" />
        ${item.title}
      </li>`);
    });
  }

  function getContent(url) {
    $('#resultSearch').block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', color: '#fff', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      data: {
        type: 'get',
        searchArticle: $('#typeSearch').val(),
        query: url,
      },
      url: '?',
      type: 'POST',
      success: function (res) {
        $('#resultSearch').unblock();
        $('#resultTitle').val(res.title);
        $('#isImgResult').hide();
        $('#result').show();
        $('#resultContentHTML').val(res.content);
        editor.clipboard.dangerouslyPasteHTML(res.content);
      },
      error: function (e) {
        $('#resultSearch').unblock();
        const msg = e.responseJSON?.msg || 'There is an error!';

        Swal.fire({
          title: 'Bad News!',
          text: msg,
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
    });
  }

  function showContent(data, type) {
    $('#resultTitle').val('');
    $('#resultContentHTML').val('');

    $('#result').hide();
    $('#resultContent').show();
    $('#resultContentHTML').hide();

    if (type === 'article') {
      getContent(data.url);
    } else {
      $('#result').show();
      $('#resultTitle').val(data.title);
      $('#resultContentHTML').val(
        `<p style="text-align: center;"><img src="${data.src.medium}" alt="${data.title} - Jago Post"/></p>`
      );
      $('#imgResult').attr('src', data.src.small);
      $('#isImgResult').show();
      $('#resultContent').hide();
      $('#resultContentHTML').show();
    }
  }
});
