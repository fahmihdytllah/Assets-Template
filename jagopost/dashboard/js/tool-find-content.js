$(function () {
  const formTools = $('#formTools'),
    clipboardList = [].slice.call(document.querySelectorAll('.clipboard-btn'));

  let dataArticles = [],
    dataImages = [];

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
          dataImages = getRandomItems(res.data, 5);
          loadImages(dataImages);
        } else {
          dataArticles = getRandomItems(res.data, 5);
          loadArticles(dataArticles);
        }
        Swal.fire({
          title: 'Good job!',
          text: 'Successfully search content',
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
        $('#resultContent').val(res.content);
        $('#isImgResult').hide();
      },
      error: function (e) {
        $('#resultSearch').unblock();
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
  }

  function showContent(data, type) {
    $('#result').show();
    $('#resultTitle').val('');
    $('#resultContent').val('');

    if (type === 'article') {
      getContent(data.url);
    } else {
      $('#resultTitle').val(data.title);
      $('#resultContent').val(
        `<p style="text-align: center;"><img src="${data.src.medium}" alt="${data.title} - Jago Post"/></p>`
      );
      $('#imgResult').attr('src', data.src.small);
      $('#isImgResult').show();
    }
  }

  function getRandomItems(arr, num) {
    // Clone the array to avoid modifying the original
    const clonedArray = [...arr];

    // Shuffle the array
    for (let i = clonedArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [clonedArray[i], clonedArray[j]] = [clonedArray[j], clonedArray[i]];
    }

    // Get the first 'num' items from the shuffled array
    return clonedArray.slice(0, num);
  }
});
