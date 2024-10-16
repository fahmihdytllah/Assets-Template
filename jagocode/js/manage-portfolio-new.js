'use strict';

$(function () {
  const commentEditor = document.querySelector('.comment-editor');
  const portfolioMedia = document.querySelector('#portfolio-media');
  const portfolioDate = document.querySelector('#portfolio-date');
  const portfolioCategory = document.querySelector('#portfolio-category');
  const portfolioTechnology = document.querySelector('#portfolio-technologies');
  const select2 = $('.select2');

  let contentEditor,
    images = [];

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
  if (commentEditor) {
    contentEditor = new Quill(commentEditor, {
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
      placeholder: 'Content Portfolio',
      theme: 'snow',
    });
  }

  // previewTemplate: Updated Dropzone default previewTemplate
  // ! Don't change it unless you really know what you are doing
  const previewTemplate = `<div class="dz-preview dz-file-preview">
<div class="dz-details">
  <div class="dz-thumbnail">
    <img data-dz-thumbnail>
    <span class="dz-nopreview">No preview</span>
    <div class="dz-success-mark"></div>
    <div class="dz-error-mark"></div>
    <div class="dz-error-message"><span data-dz-errormessage></span></div>
    <div class="progress">
      <div class="progress-bar progress-bar-primary" role="progressbar" aria-valuemin="0" aria-valuemax="100" data-dz-uploadprogress></div>
    </div>
  </div>
  <div class="dz-filename" data-dz-name></div>
  <div class="dz-size" data-dz-size></div>
</div>
</div>`;

  // ? Start your code from here

  // Basic Dropzone
  if (portfolioMedia) {
    const myDropzone = new Dropzone(portfolioMedia, {
      previewTemplate: previewTemplate,
      parallelUploads: 1,
      maxFilesize: 5,
      acceptedFiles: '.jpg,.jpeg,.png,.gif',
      addRemoveLinks: true,
      maxFiles: 5,
      init: function () {
        this.on('addedfile', (file) => {
          uploadThumbnail(file);
        });
      },
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

  // Technology
  const Technology = new Tagify(portfolioTechnology, {
    whitelist: [
      'Bootstrap',
      'Laravel',
      'Next.Js',
      'Express.Js',
      'Socket.Io',
      'HTML',
      'PHP',
      'JavaScript',
      'CSS',
      'Node.Js',
    ],
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
      mode: 'range',
      defaultDate: date,
    });
  }

  $('.btn-discard').click(function () {
    window.location.href = '/portfolio';
  });

  $('.btn-publish').click(function () {
    const category = JSON.parse($('#portfolio-category').val()).map(function (tag) {
      return tag.value;
    });

    const technologies = JSON.parse($('#portfolio-technologies').val()).map(function (tag) {
      return tag.value;
    });

    const [startDate, endDate] = $('#portfolio-date').val().split(' to ');

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
        title: $('#portfolio-title').val(),
        description: $('#portfolio-description').val(),
        content: $('#content-html').val(),
        link: $('#portfolio-link').val(),
        category,
        technologies,
        images,
        status: $('#portfolio-status').val(),
        startDate,
        endDate,
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
          window.location.href = '/portfolio';
        }, 2000);
      },
      error: function (e) {
        $.unblockUI();
        const msg = e.responseJSON.msg;
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
        const storageRef = storage.ref().child('portfolios/' + file.name);
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

  function uploadThumbnail(file) {
    if (file) {
      const storageRef = storage.ref().child('portfolios/' + file.name);
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
          uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
            images.push(downloadURL);
          });
        }
      );
    }
  }
});
