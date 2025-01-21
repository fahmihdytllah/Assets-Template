$(function () {
  let formSelectLanguage = $('#formSelectLanguage'),
    formSearchContent = $('#formSearchContent'),
    blogID = $('#blogID').val(),
    select2 = $('.select2'),
    clipboardList = [].slice.call(document.querySelectorAll('.clipboard-btn')),
    dataArticles = [],
    dataImages = [],
    modeLanguage = null,
    tagify = null,
    editor = null;

  loadLabels(blogID);
  loadDataSocial();

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

  $('#select-blogs').on('select2:select', function (e) {
    let _blogID = e.params.data.id;

    $('#blogID').val(_blogID);
    loadLabels(_blogID);
  });

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

  editor = new Quill('#full-editor', {
    bounds: '#full-editor',
    placeholder: 'Type Something...',
    modules: {
      formula: true,
      toolbar: fullToolbar,
    },
    theme: 'snow',
  });

  $('.formNewPost').submit(function (e) {
    e.preventDefault();

    if ($('#content-text').is(':visible')) {
      $('#content-html').val($('.ql-editor').html());
    }

    $.blockUI({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      data: $(this).serialize(),
      url: $(this).attr('action'),
      type: 'POST',
      success: function (res) {
        $.unblockUI();
        Swal.fire({
          title: 'Good News!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
        }).then(() => {
          const url = blogID === 'wp' ? '/u/w/posts' : '/u/b/posts/';
          window.location.href = url;
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

  formSelectLanguage.submit(function (e) {
    e.preventDefault();

    if (modeLanguage === 'translate') {
      translateContent();
    } else {
      AiContent();
    }
  });

  $('.pinterestShare').change(function () {
    if ($(this).is(':checked')) {
      $('#displaySelectBoard').show();
    } else {
      $('#displaySelectBoard').hide();
    }
  });

  $('.facebookShare').change(function () {
    if ($(this).is(':checked')) {
      $('#displaySelectPage').show();
    } else {
      $('#displaySelectPage').hide();
    }
  });

  function loadDataSocial() {
    $.get('/api/graphql?use=social', function (res) {
      if (res.isLoggedPinterest) {
        $('#selectBoard').html('');
        res.listBoards.forEach((board) => {
          $('#selectBoard').append(`<option value="${board.id}">${board.name}</option>`);
        });

        $('.pinterestShare').prop('disabled', false);
      } else {
        $('.pinterestShare').prop('disabled', true);
        $('#displaySelectBoard').hide();
      }

      if (res.isLoggedFacebook) {
        $('#selectPage').html('');
        res.listPages.forEach((page) => {
          $('#selectPage').append(`<option value="${page.id}[]${page.access_token}">${page.name}</option>`);
        });

        $('.facebookShare').prop('disabled', false);
      } else {
        $('.facebookShare').prop('disabled', true);
        $('#displaySelectPage').hide();
      }

      if (res.isLoggedTwitter) {
        $('.twitterShare').prop('disabled', false);
      } else {
        $('.twitterShare').prop('disabled', true);
      }

      if (res.isLoggedLinkedin) {
        $('.linkedinShare').prop('disabled', false);
      } else {
        $('.linkedinShare').prop('disabled', true);
      }
    });
  }

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
        const msg = e.responseJSON.msg;
        Swal.fire({
          title: 'Upss!',
          text: msg ? msg : 'There is an error!',
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
        $('#title').val('');
        $('.ql-editor').html('');

        $('#title').val(res.title);
        editor.clipboard.dangerouslyPasteHTML(res.content);

        $('#listSearchs').unblock();
        $('#modalSearchContent').modal('hide');
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

  const updateTagify = (data) => {
    if (!tagify) {
      const formLabel = document.querySelector('#labels');
      tagify = new Tagify(formLabel, {
        whitelist: data,
        maxTags: 10,
        dropdown: { maxItems: 20, classname: '', enabled: 0, closeOnSelect: !1 },
      });
    } else {
      tagify.settings.whitelist = data;
      tagify.removeAllTags();
      tagify.addTags([]);
    }
  };

  function loadLabels(id) {
    $.getJSON('?type=getLabel&id=' + id, function (res) {
      updateTagify(res);
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
