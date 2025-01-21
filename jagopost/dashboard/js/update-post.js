$(function () {
  const formSelectLanguage = $('#formSelectLanguage');
  const formSearchContent = $('#formSearchContent');
  const formEditPost = $('#formEditPost');
  const select2 = $('.select2');
  const clipboardList = [].slice.call(document.querySelectorAll('.clipboard-btn'));

  let dataArticles = [];
  let dataImages = [];
  let modeLanguage = null;
  let editor = null;
  let tagify = null;

  loadLabels();

  /** Smart Tools */
  $(document).on('click', '.btn-ai', function () {
    Swal.fire({
      title: 'Are you sure?',
      html: 'want to use AI Content',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, use it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-label-secondary waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (e) {
      if (e.value) {
        modeLanguage = 'ai';
        $('#modalSelectLanguage').modal('show');
      }
    });
  });

  $(document).on('click', '.btn-spin', function () {
    Swal.fire({
      title: 'Are you sure?',
      html: 'want to Spin this Content',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, use it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-label-secondary waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (e) {
      if (e.value) {
        spinContent();
      }
    });
  });

  $(document).on('click', '.btn-translate', function () {
    Swal.fire({
      title: 'Are you sure?',
      html: 'want to Translate this Content',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, use it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-label-secondary waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (e) {
      if (e.value) {
        modeLanguage = 'translate';
        $('#modalSelectLanguage').modal('show');
      }
    });
  });
  /** /Smart Tools */

  $(document).on('click', '.btn-delete', function () {
    Swal.fire({
      title: 'Are you sure?',
      html: 'Want to delete this post permanently',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, use it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-label-secondary waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (e) {
      if (e.value) {
        deletPost();
      }
    });
  });

  $('#modalResultContent').on('hidden.bs.modal', function () {
    $('#modalSearchContent').modal('show');
  });

  $('#changeView').on('change', function () {
    if (this.value === 'html') {
      $('#content-html').show();
      $('#content-text').hide();
      $('#content-html').val(editor.root.innerHTML);
    } else {
      $('#content-text').show();
      $('#content-html').hide();
      editor.clipboard.dangerouslyPasteHTML($('#content-html').val());
    }
  });

  const fullToolbar = [
    [{ font: [] }, { size: [] }, { header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }, { script: 'super' }, { script: 'sub' }],
    ['direction', { align: [] }, { indent: '-1' }, { indent: '+1' }],
    [{ list: 'ordered' }, { list: 'bullet' }, 'blockquote', 'code-block'],
    ['link', 'image', 'video', 'formula'],
    ['clean'],
  ];

  editor = new Quill('#full-editor', {
    bounds: '#full-editor',
    placeholder: 'Type Something...',
    modules: {
      formula: true,
      toolbar: fullToolbar,
    },
    theme: 'snow',
  });

  formEditPost.submit(function (e) {
    e.preventDefault();

    if ($('#content-text').is(':visible')) {
      $('#content-html').val(editor.root.innerHTML);
    }

    $.blockUI({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      data: $(this).serialize(),
      url: $(this).attr('action'),
      type: 'PUT',
      success: function (res) {
        $.unblockUI();

        Swal.fire({
          title: 'Good News!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
      error: function (e) {
        $.unblockUI();
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

  function deletPost() {
    $.blockUI({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '?',
      type: 'DELETE',
      success: function (res) {
        $.unblockUI();
        Swal.fire({
          title: 'Good News!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        }).then(() => (location.href = formEditPost.attr('action')));
      },
      error: function (e) {
        $.unblockUI();
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

  /** Smart Tools */
  formSelectLanguage.submit(function (e) {
    e.preventDefault();

    if (modeLanguage === 'translate') {
      translateContent();
    } else {
      AiContent();
    }
  });

  /** Search Content */
  $('#typeFind').change(function () {
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

  formSearchContent.submit(function (e) {
    e.preventDefault();

    formSearchContent.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', color: '#fff', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      data: $(this).serialize(),
      url: '/u/tool/search-content',
      type: 'POST',
      success: function (res) {
        formSearchContent.unblock();
        if (res.type === 'image') {
          dataImages = getRandomItems(res.data, 5);
          loadImages(dataImages);
        } else {
          dataArticles = getRandomItems(res.data, 5);
          loadArticles(dataArticles);
        }
        Swal.fire({
          title: 'Good News!',
          text: 'Successfully searched for article content',
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
      error: function (e) {
        formSearchContent.unblock();
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
    $('#listSearchs').block({
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
      url: '/u/tool/search-content?',
      type: 'POST',
      success: function (res) {
        $('#resultTitle').val(res.title);
        $('#resultContent').val(res.content);
        $('#isImgResult').hide();
        $('#listSearchs').unblock();
        $('#modalSearchContent').modal('hide');
        $('#modalResultContent').modal('show');
      },
      error: function (e) {
        $('#listSearchs').unblock();
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
    $('#resultContent').val('');

    if (type === 'article') {
      getContent(data.url);
    } else {
      $('#modalSearchContent').modal('hide');
      $('#modalResultContent').modal('show');
      $('#resultTitle').val(data.title);
      $('#resultContent').val(
        `<p style="text-align: center;"><img src="${data.src.medium}" alt="${data.title} - Jago Post"/></p>`
      );
      $('#imgResult').attr('src', data.src.small);
      $('#isImgResult').show();
    }
  }

  /** AI Content */
  function AiContent() {
    formSelectLanguage.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      data: {
        prompt: editor.root.innerHTML,
        mode: 'extract',
        language: $('#toTrans option:selected').text(),
      },
      url: '/u/tool/ai-content',
      type: 'POST',
      success: function (res) {
        $('#title').html('');
        $('.ql-editor').html('');

        $('#title').val(res.title);
        editor.clipboard.dangerouslyPasteHTML(res.content);

        $('#modalSelectLanguage').modal('hide');
        formSelectLanguage.unblock();
        Swal.fire({
          title: 'Good News!',
          text: 'Successfully regenerated content with AI',
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
      error: function (e) {
        formSelectLanguage.unblock();
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

  /** Spin Content */
  function spinContent() {
    $.blockUI({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });
    $.ajax({
      data: {
        text: editor.root.innerHTML,
        lang: 'en',
      },
      url: '/u/tool/article-spinner',
      type: 'POST',
      success: function (res) {
        $.unblockUI();
        editor.clipboard.dangerouslyPasteHTML(res.content);
        Swal.fire({
          title: 'Good News!',
          text: d.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
      error: function (e) {
        $.unblockUI();
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

  /** Translate Content */
  function translateContent() {
    formSelectLanguage.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      data: {
        text: '<p>' + $('#title').val() + '</p>[]' + editor.root.innerHTML,
        from: $('#fromTrans').val(),
        to: $('#toTrans').val(),
      },
      url: '/u/tool/translate-content',
      type: 'POST',
      success: function (res) {
        $('#title').html('');
        $('.ql-editor').html('');

        const result = res.content.split('[]');
        $('#title').val(result[1]);
        editor.clipboard.dangerouslyPasteHTML(result[1]);
        tagify.addTags(res.labels);

        $('#modalSelectLanguage').modal('hide');
        formSelectLanguage.unblock();

        Swal.fire({
          title: 'Good News!',
          text: 'Successfully translated content.',
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        });
      },
      error: function (e) {
        formSelectLanguage.unblock();
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

  function loadLabels() {
    $.getJSON('?type=getLabel', function (res) {
      tagify = new Tagify(document.querySelector('#labels'), {
        whitelist: res,
        maxTags: 10,
        dropdown: { maxItems: 20, classname: '', enabled: 0, closeOnSelect: !1 },
      });
    });
  }

  if (select2.length) {
    select2.each(function () {
      var $this = $(this);
      $this.wrap('<div class="position-relative"></div>').select2({
        placeholder: 'Select language',
        dropdownParent: $this.parent(),
      });
    });
  }

  if (ClipboardJS) {
    clipboardList.map(function (clipboardEl) {
      const clipboard = new ClipboardJS(clipboardEl);
      clipboard.on('success', function (e) {
        if (e.action == 'copy') {
          Swal.fire({
            text: 'Copied to Clipboard!!',
            icon: 'success',
            customClass: { confirmButton: 'btn btn-primary' },
            buttonsStyling: !1,
          });
        }
      });
    });
  } else {
    clipboardList.map(function (clipboardEl) {
      clipboardEl.setAttribute('disabled', true);
    });
  }
  function getRandomItems(arr, num) {
    const clonedArray = [...arr];

    for (let i = clonedArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [clonedArray[i], clonedArray[j]] = [clonedArray[j], clonedArray[i]];
    }

    return clonedArray.slice(0, num);
  }
});
