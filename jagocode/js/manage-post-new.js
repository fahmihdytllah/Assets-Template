'use strict';

$(function () {
  const contentEditorEl = document.querySelector('.comment-editor');
  const portfolioDate = document.querySelector('#post-date');
  const portfolioCategory = document.querySelector('#post-category');
  const select2 = $('.select2');

  let contentEditor = null;

  // Inisialisasi Firebase
  const firebaseConfig = {
    apiKey: 'AIzaSyClXd1AAB_Nzlm52X4GB7V9TR0Rv8YCu1w',
    authDomain: 'jago-code.firebaseapp.com',
    projectId: 'jago-code',
    storageBucket: 'jago-code.appspot.com',
    messagingSenderId: '733341114140',
    appId: '1:733341114140:web:aee7d8fd24e979e9bba4d9',
    measurementId: 'G-4CDRVEBPJD',
  };

  firebase.initializeApp(firebaseConfig);

  // Referensi ke Firebase Storage
  const storage = firebase.storage();

  // Select2
  if (select2.length) {
    select2.each(function () {
      var $this = $(this);
      $this.wrap('<div class="position-relative"></div>').select2({
        dropdownParent: $this.parent(),
        placeholder: $this.data('placeholder'), // for dynamic placeholder
      });
    });
  }

  $('#changeView').on('change', function () {
    if (this.value === 'html') {
      $('#content-html').show();
      $('#content-text').hide();
      $('#content-html').val(contentEditor.root.innerHTML);
    } else {
      $('#content-text').show();
      $('#content-html').hide();
      contentEditor.clipboard.dangerouslyPasteHTML($('#content-html').val());
    }
  });

  // Comment editor
  if (contentEditorEl) {
    contentEditor = new Quill(contentEditorEl, {
      modules: {
        toolbar: {
          container: [
            [{ font: [] }],
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ script: 'sub' }, { script: 'super' }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['blockquote', 'code-block'],
            ['link', 'image', 'video'],
            ['clean'],
          ],
          handlers: {
            image: imageHandler,
          },
        },
      },
      placeholder: 'Product Description',
      theme: 'snow',
    });
  }

  // Category
  const Category = new Tagify(portfolioCategory, {
    whitelist: ['SaaS Software', 'Web Development', 'Mobile App', 'Design', 'Other'],
    maxTags: 10,
    dropdown: {
      maxItems: 10,
      enabled: 0,
      closeOnSelect: false,
    },
  });

  // Flatpickr
  const date = new Date();
  if (portfolioDate) {
    portfolioDate.flatpickr({
      defaultDate: date,
    });
  }

  $('.btn-discard').click(function () {
    window.location.href = '/blog';
  });

  $('.btn-publish').click(function () {
    const labels = JSON.parse($('#post-category').val()).map(function (tag) {
      return tag.value;
    });

    if ($('#content-text').is(':visible')) {
      $('#content-html').val(contentEditor.root.innerHTML);
    }

    $.blockUI({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '?',
      type: 'POST',
      data: JSON.stringify({
        title: $('#post-title').val(),
        content: $('#content-html').val(),
        labels,
        status: $('#post-status').val(),
        publishedAt: $('#post-date').val(),
      }),
      contentType: 'application/json',
      success: function (res) {
        $.unblockUI();
        Swal.fire({
          title: 'Good job!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-success waves-effect waves-light' },
        });

        setTimeout(function () {
          window.location.href = '/blog';
        }, 2000);
      },
      error: function (e) {
        $.unblockUI();
        const msg = e.responseJSON?.msg;
        Swal.fire({
          title: 'Upss!',
          text: msg ? msg : 'There is an error!',
          icon: 'error',
          customClass: { confirmButton: 'btn btn-primary' },
        });
      },
    });
  });

  // upload image
  function imageHandler() {
    let input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = function () {
      var file = input.files[0];

      if (file) {
        const storageRef = storage.ref().child('posts/' + file.name);
        const uploadTask = storageRef.put(file);
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Upload progress: ' + progress + '%');
          },
          (error) => {
            console.error('Error uploading file: ', error);
          },
          () => {
            uploadTask.snapshot.ref.getDownloadURL().then((imageUrl) => {
              const range = contentEditor.getSelection();
              quill.insertEmbed(range.index, 'image', imageUrl);
            });
          }
        );
      }
    };
  }
});
