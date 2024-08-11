$(function () {
  let select2 = $('.select2'),
    formCampaign = $('#formCampaign'),
    loader = $('.loader'),
    localGraph = {},
    keywords = null,
    isModeAdd = true,
    isGraphLoaded = false,
    campaignId = null;

  loadCampaigns();
  loadDataGrapgh();

  keywords = new Tagify(document.querySelector('#keywords'), {
    whitelist: $('#suggestsQuery').val().split(', '),
    maxTags: 10,
    dropdown: { maxItems: 20, classname: '', enabled: 0, closeOnSelect: false },
  });

  if (select2.length) {
    select2.each(function () {
      var $this = $(this);
      $this.wrap('<div class="position-relative"></div>').select2({
        placeholder: 'Select value',
        dropdownParent: $this.parent(),
      });
    });
  }

  $('.new-campaign').click(function () {
    isModeAdd = true;
    formCampaign[0].reset();

    $('#typeSearch').val(['articlecity']).trigger('change');
    $('#language').val('en').trigger('change');
    $('#timezone').val('Asia/Jakarta').trigger('change');
    $('.translateContent').prop('disabled', false);
    $('.spinnerContent').prop('disabled', false);

    $('#displaySelectPage').hide();
    $('#displaySelectBoard').hide();
    $('.aiMode').hide();

    $('.modalTitle').html('New Campaign');
    $('.modalDesc').html('Create a New Campaign auto post');
    $('.btn-create').html('<span class="ti-xs ti ti-api-app me-1"></span>Create Campaign');
    $('#modalCampaign').modal('show');
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

  $('.aiContent').change(function () {
    if ($(this).is(':checked')) {
      $('.aiMode').show();

      $('.translateContent').prop('checked', false);
      $('.translateContent').prop('disabled', true);
      $('.spinnerContent').prop('checked', false);
      $('.spinnerContent').prop('disabled', true);
    } else {
      $('.aiMode').hide();
      $('.translateContent').prop('disabled', false);
      $('.spinnerContent').prop('disabled', false);
    }
  });

  $('#listCampaigns').on('click', '.edit-campaign', function () {
    const id = $(this).data('id');
    if (isGraphLoaded) {
      editCampaign(id);
    }
  });

  $('#listCampaigns').on('click', '.delete-campaign', function () {
    const id = $(this).data('id');

    Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this post!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      customClass: {
        confirmButton: 'btn btn-primary me-3 waves-effect waves-light',
        cancelButton: 'btn btn-label-secondary waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        deleteCampaign(id);
      }
    });
  });

  formCampaign.submit(function (e) {
    e.preventDefault();

    formCampaign.block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    let paramAjax = {};
    if (isModeAdd) {
      paramAjax = {
        url: '?',
        type: 'POST',
      };
    } else {
      paramAjax = {
        url: 'campaign/' + campaignId,
        type: 'PUT',
      };
    }

    $.ajax({
      ...paramAjax,
      ...{
        data: $(this).serialize(),
        success: function (d) {
          formCampaign.unblock();
          $('#modalCampaign').modal('hide');
          loadCampaigns();

          Swal.fire({
            title: 'Good job!',
            text: d.msg,
            icon: 'success',
            customClass: { confirmButton: 'btn btn-primary' },
            buttonsStyling: false,
          });
        },
        error: function (e) {
          formCampaign.unblock();
          const msg = e.responseJSON.msg;
          Swal.fire({
            title: 'Upss!',
            text: msg ? msg : 'There is an error!',
            icon: 'error',
            customClass: { confirmButton: 'btn btn-primary' },
            buttonsStyling: !1,
          });
        },
      },
    });
  });

  function loadDataGrapgh() {
    $.get('/api/graphql?use=social,blogger,indexer', function (res) {
      localGraph = res;
      isGraphLoaded = true;

      if (res.isLoggedGoogle) {
        $('#selectBlogs').html('');
        res.listBlogs.forEach((blog) => {
          $('#selectBlogs').append(`<option value="${blog.id}">${blog.name}</option>`);
        });

        $('.googleIndexer').prop('disabled', false);
      } else {
        $('.googleIndexer').prop('disabled', true);
      }

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
          $('#selectPage').append(
            `<option data-page="${page.id}" value="${page.id}[]${page.access_token}">${page.name}</option>`
          );
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

      if (res.isLoggedBing) {
        $('.bingIndexer').prop('disabled', false);
      } else {
        $('.bingIndexer').prop('disabled', true);
      }

      if (res.isLoggedYandex) {
        $('.yandexIndexer').prop('disabled', false);
      } else {
        $('.yandexIndexer').prop('disabled', true);
      }

      $('.new-campaign').prop('disabled', false);
      $('.new-campaign').html('<span class="ti-xs ti ti-plus me-1"></span>New Campaign');
      $('.edit-campaign').prop('disabled', false);
    });
  }

  function loadCampaigns() {
    $('#listCampaigns').html('');
    loader.show();

    $.get('?type=json', function (res) {
      loader.hide();
      if (res.data?.length === 0) {
        $('#listCampaigns').html(`<div class="col-md-12">
          <div class="bg-lighter rounded p-3 mb-3 position-relative">
            <span class="text-muted">You don't have an campaign yet.
          </div>
        </div>`);
      } else {
        res.data.forEach((camp) => {
          const schedule =
            camp.days.length == '7'
              ? 'Repeat every day.'
              : camp.days.length == '6' && camp.days.includes('Sun')
              ? 'Repeats every Monday to Friday.'
              : `Repeats every ${camp.days.join(', ')}.`;

          $('#listCampaigns').append(`<div class="col-md-6" id="${camp._id}">
            <div class="bg-lighter rounded p-3 mb-3 position-relative">
              <div class="dropdown api-key-actions">
                <a class="btn dropdown-toggle text-muted hide-arrow p-0" data-bs-toggle="dropdown"><i class="ti ti-dots-vertical ti-sm"></i></a>
                <div class="dropdown-menu dropdown-menu-end">
                  <button class="dropdown-item edit-campaign" data-id="${camp._id}" ${
            isGraphLoaded ? '' : 'disabled'
          }><i class="ti ti-edit me-2"></i>Edit</button>
                  <button class="dropdown-item text-danger delete-campaign" data-id="${
                    camp._id
                  }"><i class="ti ti-trash me-2"></i>Remove</button>
                </div>
              </div>
              <div class="d-flex align-items-center mb-3">
                <h4 class="mb-0 me-3">${camp.name}</h4>
                <span class="badge bg-label-${camp.isActive ? 'success' : 'danger'}">${
            camp.isActive ? 'ACTIVE' : 'NON ACTIVE'
          }</span>
              </div>
              <div class="d-flex align-items-center mb-3">
                <span class="badge bg-label-info rounded-pill me-2">Keywords:</span>
                <p class="me-2 mb-0 fw-medium">${camp.keywords.join(', ')}</p>
              </div>
              <span class="text-muted">${schedule}</span>
            </div>
          </div>`);
        });
      }
    });
  }

  function editCampaign(id) {
    isModeAdd = false;
    campaignId = id;
    formCampaign[0].reset();

    $('.modalTitle').html('Update Campaign');
    $('.modalDesc').html("Change your campaign data if anything doesn't match");
    $('.btn-create').html('<span class="ti-xs ti ti-api-app me-1"></span>Save Changes');

    $.get('?type=detail&id=' + id, function (res) {
      $('#name').val(res.data?.name);
      $('#selectBlogs').val(res.data?.blogId).trigger('change');
      $('#typeSearch').val(res.data?.typeSearch).trigger('change');
      $('#language').val(res.data?.language).trigger('change');

      keywords.removeAllTags();
      keywords.addTags(res.data?.keywords);

      /** scheduling */
      $('#hours').val(res.data?.hours);
      $('#timezone').val(res.data?.timezone).trigger('change');
      $('input[name="days"]').each(function () {
        var day = $(this).val();
        if (res.data?.days.includes(day)) {
          $(this).prop('checked', true);
        }
      });

      /** setting */
      if (res.data?.isActive) {
        $('.autoPost').prop('checked', true);
      } else {
        $('.autoPost').prop('checked', false);
      }

      if (res.data?.isAiContent) {
        $('.aiContent').prop('checked', true);
        $('.aiMode').show();
        $('input[name="aiMode"][value="' + res.data.aiMode + '"]').prop('checked', true);

        $('.translateContent').prop('checked', false);
        $('.translateContent').prop('disabled', true);
        $('.spinnerContent').prop('checked', false);
        $('.spinnerContent').prop('disabled', true);
      } else {
        $('.aiContent').prop('checked', false);
        $('.aiMode').hide();
      }

      if (res.data?.isSpinnerContent) {
        $('.spinnerContent').prop('checked', true);
      } else {
        $('.spinnerContent').prop('checked', false);
      }

      if (res.data?.isTranslateContent) {
        $('.translateContent').prop('checked', true);
      } else {
        $('.translateContent').prop('checked', false);
      }

      /** indexing */
      if (!localGraph.isLoggedBing) {
        $('.bingIndexer').prop('disabled', true);
      } else if (res.data?.isBingIndexer) {
        $('.bingIndexer').prop('disabled', false);
        $('.bingIndexer').prop('checked', true);
      } else {
        $('.bingIndexer').prop('checked', false);
      }

      if (!localGraph.isLoggedGoogle) {
        $('.googleIndexer').prop('disabled', true);
      } else if (res.data?.isGoogleIndexer) {
        $('.googleIndexer').prop('disabled', false);
        $('.googleIndexer').prop('checked', true);
      } else {
        $('.googleIndexer').prop('checked', false);
      }

      if (!localGraph.isLoggedYandex) {
        $('.yandexIndexer').prop('disabled', true);
      } else if (res.data?.isYandexIndexer) {
        $('.yandexIndexer').prop('disabled', false);
        $('.yandexIndexer').prop('checked', true);
      } else {
        $('.yandexIndexer').prop('checked', false);
      }

      /** sharer */
      if (!localGraph.isLoggedPinterest) {
        $('.pinterestShare').prop('disabled', true);
      } else if (res.data?.isPinterestShare) {
        $('.pinterestShare').prop('disabled', false);
        $('.pinterestShare').prop('checked', true);
        $('#selectBoard').val(res.data?.boardId).trigger('change');
        $('#displaySelectBoard').show();
      } else {
        $('.pinterestShare').prop('checked', false);
        $('#displaySelectBoard').hide();
      }

      if (!localGraph.isLoggedFacebook) {
        $('.facebookShare').prop('disabled', true);
      } else if (res.data?.isFacebookShare) {
        let selectedPage = $('#selectPage option[data-page="' + res.data.pageId + '"]').val();
        $('.facebookShare').prop('disabled', false);
        $('.facebookShare').prop('checked', true);
        $('#selectPage').val(selectedPage).trigger('change');
        $('#displaySelectPage').show();
      } else {
        $('.facebookShare').prop('checked', false);
        $('#displaySelectPage').hide();
      }

      if (!localGraph.isLoggedTwitter) {
        $('.twitterShare').prop('disabled', true);
      } else if (res.data?.isTwitterShare) {
        $('.twitterShare').prop('disabled', false);
        $('.twitterShare').prop('checked', true);
      } else {
        $('.twitterShare').prop('checked', false);
      }

      if (!localGraph.isLoggedLinkedin) {
        $('.linkedinShare').prop('disabled', true);
      } else if (res.data?.isLinkedinShare) {
        $('.linkedinShare').prop('disabled', false);
        $('.linkedinShare').prop('checked', true);
      } else {
        $('.linkedinShare').prop('checked', false);
      }

      setTimeout(function () {
        $('#modalCampaign').modal('show');
      }, 200);
    });
  }

  function deleteCampaign(id) {
    $.blockUI({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });
    $.ajax({
      url: 'campaign/' + id,
      type: 'DELETE',
      success: function (d) {
        $.unblockUI();
        loadCampaigns();

        Swal.fire({
          title: 'Good job!',
          text: d.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-success waves-effect waves-light' },
        });
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
  }
});
