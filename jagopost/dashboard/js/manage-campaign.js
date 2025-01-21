$(function () {
  const select2 = $('.select2');
  const formCampaign = $('#formCampaign');
  const loader = $('.loader');

  let isModeAdd = true;
  let isGraphLoaded = false;
  let keywords = null;
  let campaignId = null;

  let LOCAL_GRAPH = {};
  let LOCAL_BLOGS = {};

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

  $('#selectPlatforms').change(function () {
    const platform = $(this).val();
    changeBlog(platform);
  });

  $('.new-campaign').click(function () {
    isModeAdd = true;
    formCampaign[0].reset();

    $('#typeSearch').val(['articlecity']).trigger('change');
    $('#language').val('en').trigger('change');
    $('.translateContent').prop('disabled', false);
    $('.spinnerContent').prop('disabled', false);

    $('#displaySelectPage').hide();
    $('#displaySelectBoard').hide();
    $('.aiMode').hide();
    $('.cronSyntax').hide();
    $('.cronManual').show();

    $('#blogName').val(LOCAL_BLOGS[LOCAL_GRAPH.platform][0].title);

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

  $('.cronTime').change(function () {
    if ($(this).is(':checked')) {
      $('.cronSyntax').show();
      $('.cronManual').hide();
    } else {
      $('.cronManual').show();
      $('.cronSyntax').hide();
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
      html: "Want to delete this campaign, can't be recovered",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, remove it!',
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
        success: function (res) {
          formCampaign.unblock();
          $('#modalCampaign').modal('hide');
          loadCampaigns();

          Swal.fire({
            title: 'Good News!',
            text: res.msg,
            icon: 'success',
            customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          });
        },
        error: function (e) {
          formCampaign.unblock();
          const msg = e.responseJSON?.msg || 'There is an error!';

          Swal.fire({
            title: 'Bad News!',
            text: msg,
            icon: 'error',
            customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          });
        },
      },
    });
  });

  function changeBlog(platform) {
    /** Load blogs */
    $('#selectBlogs').html('');
    $('#blogName').val(LOCAL_BLOGS[platform][0].title);

    LOCAL_BLOGS[platform].forEach((blog) => {
      $('#selectBlogs').append(`<option value="${blog.id}">${blog.title}</option>`);
    });

    $('#selectBlogs').trigger('change');
  }

  function loadDataGrapgh() {
    $.get('/api/graphql?use=social,blog,indexer', function (res) {
      LOCAL_GRAPH = res;
      LOCAL_BLOGS = res.listBlogs;
      isGraphLoaded = true;

      /** Load blogs */
      if (LOCAL_BLOGS[res.platform]?.length) {
        $('#selectBlogs').html('');
        $('#blogName').val(LOCAL_BLOGS[res.platform][0].title);

        LOCAL_BLOGS[res.platform].forEach((blog) => {
          $('#selectBlogs').append(`<option value="${blog.id}">${blog.title}</option>`);
        });

        $('#selectBlogs').trigger('change');
      }

      if (res.isLoggedGoogleSearch) {
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
      $('.new-campaign').html('<span class="ti ti-plus me-2"></span>Create Campaign');
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
        res.data.forEach((campaign) => {
          let keywords = '';
          campaign.keywords.forEach((keyword) => {
            keywords += '<span class="badge rounded-pill me-1 mb-1 bg-label-dark fw-medium">' + keyword + '</span>';
          });

          $('#listCampaigns').append(
            '<div class="col-md-6 mb-4">' +
              '<div class="card card-campaign h-100">' +
              '<div class="card-body">' +
              '<div class="d-flex justify-content-center justify-content-between">' +
              '<h5 class="card-title">' +
              campaign.name +
              '</h5>' +
              '<button class="btn dropdown-toggle dropdown-toggle-split hide-arrow cursor-pointer" data-bs-toggle="dropdown"><i class="ti ti-dots-vertical"></i></button>' +
              '<div class="dropdown-menu">' +
              '<button class="dropdown-item edit-campaign" data-id="' +
              campaign._id +
              '" ' +
              '><i class="ti ti-edit me-2"></i>Update</button>' +
              '<div class="dropdown-divider"></div>' +
              '<button class="dropdown-item text-danger delete-campaign" data-id="' +
              campaign._id +
              '" ' +
              (isGraphLoaded ? '' : 'disabled') +
              '><i class="ti ti-trash me-2"></i>Delete</button>' +
              '</div>' +
              '</div>' +
              '<div class="d-flex align-items-center mb-6">' +
              '<span class="badge rounded-pill bg-label-' +
              (campaign.isActive ? 'success' : 'danger') +
              ' me-2">' +
              (campaign.isActive ? 'Running' : 'Stopping') +
              '</span>' +
              '<span class="badge rounded-pill bg-label-primary me-2">' +
              campaign.platform.capitalize() +
              '</span>' +
              '<span class="badge rounded-pill bg-label-info">' +
              (campaign?.additionalData?.blogName || '-') +
              '</span>' +
              '</div>' +
              keywords +
              '</div>' +
              '<div class="card-footer">' +
              '<span class="text-muted">' +
              campaign.cronText +
              '</span>' +
              '</div>' +
              '</div>' +
              '</div>'
          );
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
      const campaign = res.data;

      $('#name').val(campaign?.name);
      $('#typeSearch').val(campaign?.typeSearch).trigger('change');
      $('#language').val(campaign?.language).trigger('change');
      $('#selectPlatforms').val(campaign?.platform).trigger('change');

      let blogName;
      if (!campaign?.additionalData?.blogName) {
        const blog = LOCAL_BLOGS[campaign.platform].find((q) => q.id === campaign.additionalData?.blogId);
        if (blog) {
          blogName = blog.title;
        }
      }

      $('#selectBlogs').val(campaign.additionalData?.blogId).trigger('change');
      $('#blogName').val(campaign.additionalData?.blogName || blogName || '-');

      keywords.removeAllTags();
      keywords.addTags(campaign?.keywords);

      /** scheduling */
      $('#hours').val(campaign?.hours);
      $('input[name="days"]').each(function () {
        var day = $(this).val();
        if (campaign?.days.includes(day)) {
          $(this).prop('checked', true);
        }
      });

      /** setting */
      if (campaign?.isActive) {
        $('.autoPost').prop('checked', true);
      } else {
        $('.autoPost').prop('checked', false);
      }

      if (campaign?.isCronSyntax) {
        $('#cronSyntax').val(campaign.cronSyntax);
        $('.cronTime').prop('checked', true);
        $('.cronSyntax').show();
        $('.cronManual').hide();
      } else {
        $('.cronTime').prop('checked', false);
        $('.cronSyntax').hide();
        $('.cronManual').show();
      }

      if (campaign?.isAiContent) {
        $('.aiContent').prop('checked', true);
        $('.aiMode').show();
        $('input[name="aiMode"][value="' + campaign.aiMode + '"]').prop('checked', true);

        $('.translateContent').prop('checked', false);
        $('.translateContent').prop('disabled', true);
        $('.spinnerContent').prop('checked', false);
        $('.spinnerContent').prop('disabled', true);
      } else {
        $('.aiContent').prop('checked', false);
        $('.aiMode').hide();
      }

      if (campaign?.isSpinnerContent) {
        $('.spinnerContent').prop('checked', true);
      } else {
        $('.spinnerContent').prop('checked', false);
      }

      if (campaign?.isTranslateContent) {
        $('.translateContent').prop('checked', true);
      } else {
        $('.translateContent').prop('checked', false);
      }

      /** indexing */
      if (!LOCAL_GRAPH.isLoggedBing) {
        $('.bingIndexer').prop('disabled', true);
      } else if (campaign?.isBingIndexer) {
        $('.bingIndexer').prop('disabled', false);
        $('.bingIndexer').prop('checked', true);
      } else {
        $('.bingIndexer').prop('checked', false);
      }

      if (!LOCAL_GRAPH.isLoggedGoogleSearch) {
        $('.googleIndexer').prop('disabled', true);
      } else if (campaign?.isGoogleIndexer) {
        $('.googleIndexer').prop('disabled', false);
        $('.googleIndexer').prop('checked', true);
      } else {
        $('.googleIndexer').prop('checked', false);
      }

      if (!LOCAL_GRAPH.isLoggedYandex) {
        $('.yandexIndexer').prop('disabled', true);
      } else if (campaign?.isYandexIndexer) {
        $('.yandexIndexer').prop('disabled', false);
        $('.yandexIndexer').prop('checked', true);
      } else {
        $('.yandexIndexer').prop('checked', false);
      }

      /** sharer */
      if (!LOCAL_GRAPH.isLoggedPinterest) {
        $('.pinterestShare').prop('disabled', true);
      } else if (campaign?.isPinterestShare) {
        $('.pinterestShare').prop('disabled', false);
        $('.pinterestShare').prop('checked', true);
        $('#selectBoard').val(campaign?.additionalData?.boardId).trigger('change');
        $('#displaySelectBoard').show();
      } else {
        $('.pinterestShare').prop('checked', false);
        $('#displaySelectBoard').hide();
      }

      if (!LOCAL_GRAPH.isLoggedFacebook) {
        $('.facebookShare').prop('disabled', true);
      } else if (campaign?.isFacebookShare) {
        let selectedPage = $('#selectPage option[data-page="' + campaign?.additionalData?.pageId + '"]').val();
        $('.facebookShare').prop('disabled', false);
        $('.facebookShare').prop('checked', true);
        $('#selectPage').val(selectedPage).trigger('change');
        $('#displaySelectPage').show();
      } else {
        $('.facebookShare').prop('checked', false);
        $('#displaySelectPage').hide();
      }

      if (!LOCAL_GRAPH.isLoggedTwitter) {
        $('.twitterShare').prop('disabled', true);
      } else if (campaign?.isTwitterShare) {
        $('.twitterShare').prop('disabled', false);
        $('.twitterShare').prop('checked', true);
      } else {
        $('.twitterShare').prop('checked', false);
      }

      if (!LOCAL_GRAPH.isLoggedLinkedin) {
        $('.linkedinShare').prop('disabled', true);
      } else if (campaign?.isLinkedinShare) {
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
      success: function (res) {
        $.unblockUI();
        loadCampaigns();

        Swal.fire({
          title: 'Good News!',
          text: res.msg,
          icon: 'success',
          customClass: { confirmButton: 'btn btn-success waves-effect waves-light' },
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

  String.prototype.capitalize = function () {
    return this.split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
});
