$(document).ready(function () {
  let elementListBots = $('#listBots'),
    socket = io(),
    dataBots,
    showBots = {};

  graphDataBots();

  /** Socket server */
  socket.on('connect', () => {
    socket.emit('clientJoin', userId);
  });

  socket.on('clientConnected', (bot) => {
    elementListBots.prepend($('#bot-' + bot._id));
    $('#bot-' + bot._id + ' .bot-status').html(setIsActive(bot));
    $('#bot-' + bot._id + ' .btn-start').html(setIsPaused(bot));
  });

  socket.on('stop', (bot) => {
    /** Update local array */
    const indexBot = dataBots.findIndex((item) => item._id === bot._id);
    if (indexBot !== -1) {
      dataBots[indexBot] = bot;
      $('#bot-' + bot._id + ' .btn-start').html(setIsPaused(bot));
    }
  });

  socket.on('receiveDataBot', (bot) => {
    /** Update local array */
    const indexBot = dataBots.findIndex((item) => item._id === bot._id);
    if (indexBot !== -1) {
      dataBots[indexBot] = bot;
    }

    /** Update Views */
    $('#bot-' + bot._id + ' .totalHitsPerDay').html(bot.totalHitsPerDay.toLocaleString());
    $('#bot-' + bot._id + ' .totalClickAdsPerDay').html(bot.totalClickAdsPerDay.toLocaleString());
    $('#bot-' + bot._id + ' .totalViewAdsPerDay').html(bot.totalViewAdsPerDay.toLocaleString());
    $('#bot-' + bot._id + ' .totalErrorPerDay').html(bot.totalErrorPerDay.toLocaleString());
    $('#bot-' + bot._id + ' .uptime').html(bot.uptime);
    $('#bot-' + bot._id + ' .lastActivity').html(moment(bot.lastActivity).fromNow());
    $('#bot-' + bot._id + ' .bot-status').html(setIsActive(bot));
    $('#bot-' + bot._id + ' .btn-start').html(setIsPaused(bot));
  });

  /** Events jquery */
  $(document).on('click', '.bot-delete', function () {
    let $this = $(this);
    let idBot = $this.data('id');

    Swal.fire({
      text: 'Are you sure you want to remove this bot?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes',
      customClass: {
        confirmButton: 'btn btn-primary waves-effect waves-light',
        cancelButton: 'btn btn-outline-danger ms-2 waves-effect waves-light',
      },
      buttonsStyling: false,
    }).then(function (result) {
      if (result.value) {
        deleteBot($this, idBot);
      }
    });
  });

  /** Hide show details */
  $(document).on('click', '.btn-show', function () {
    let id = $(this).data('id');

    if (typeof showBots[id] === 'undefined') {
      showBots[id] = false;
    }

    if (showBots[id]) {
      $(this).html('<i class="ti ti-eye ti-sm text-info"></i>');
    } else {
      $(this).html('<i class="ti ti-eye-off ti-sm text-info"></i>');
    }

    showBots[id] = !showBots[id];
  });

  /** Start Stop bot  */
  $(document).on('click', '.btn-start', function () {
    const id = $(this).data('id');
    const indexBot = dataBots.findIndex((item) => item._id === id);
    if (indexBot !== -1) {
      socket.emit('paused', dataBots[indexBot]);
    }
  });

  $('.search-bot').on('input', function () {
    const searchTerm = $(this).val();
    $('#loadingBots').show();
    const results = searchArray(dataBots, searchTerm);
    loadBots(results);
  });

  $('#filter-key').change(function () {
    const filter = $(this).val();
    if (filter === 'all') {
      loadBots(dataBots);
    } else {
      const filtered = dataBots.filter((item) => item.keyId._id === filter);
      loadBots(filtered);
    }
  });

  $('#filter-bot').change(function () {
    const filter = $(this).val();
    const term = filter === 'online' ? true : false;
    if (filter === 'all') {
      loadBots(dataBots);
    } else {
      const filtered = dataBots.filter((item) => item.isActive === term);
      loadBots(filtered);
    }
  });

  function graphDataBots() {
    $('#loadingBots').show();

    $.get('?type=json', function (res) {
      $('#loadingBots').hide();
      dataBots = res.data;
      loadBots(dataBots);
    });
  }

  function loadBots(data) {
    elementListBots.html('');
    $('#loadingBots').hide();

    if (data?.length === 0) {
      elementListBots.html(`<div class="col-md-12">
          <div class="bg-lighter rounded p-3 mb-3 position-relative">
            <span class="text-muted">You don't have an access key yet.
          </div>
        </div>`);
    } else {
      data.forEach((bot) => {
        elementListBots.append(`<div class="col-12 col-md-6 col-lg-4 col-xl-3 mb-3" id="bot-${bot._id}">
          <div class="card bot-card">
            <div class="d-flex justify-content-between align-items-center">
              <div class="d-flex justify-content-left align-items-center">
                <i class="fis fi fi-xs fi-${bot.countryCode.toLowerCase()} rounded-circle fs-1 me-3"></i>
                <div class="d-flex flex-column">
                  <span class="fw-medium">${bot.ip}</span>
                  <div class="d-flex align-items-center bot-status">
                    ${setIsActive(bot)}
                  </div>
                </div>
              </div>

              <div class="d-flex align-items-center">
                <span class="btn-start me-2" data-id="${bot._id}">${setIsPaused(bot)}</span>
                <span class="btn-show" data-id="${bot._id}" data-bs-toggle="collapse" data-bs-target="#detail-${
          bot._id
        }" aria-expanded="false" aria-controls="detail-${bot._id}"><i class="ti ti-eye ti-sm text-info"></i></span>
              </div>
            </div>
            <div class="collapse mt-3 ${showBots[bot._id] ? 'show' : ''}" id="detail-${bot._id}">
              <div class="row">
                <div class="col-4">
                  <ul class="list-unstyled">
                    <li class="d-flex align-items-center mb-2"><i class="ti ti-users ti-sm text-secondary"></i><span class="text-muted mx-2 totalHitsPerDay">${bot.totalHitsPerDay.toLocaleString()}</span></li>
                    <li class="d-flex align-items-center mb-2"><i class="ti ti-ad ti-sm text-secondary"></i><span class="text-muted mx-2 totalViewAdsPerDay">${bot.totalViewAdsPerDay.toLocaleString()}</span></li>
                    <li class="d-flex align-items-center mb-2"><i class="ti ti-click ti-sm text-secondary"></i><span class="text-muted mx-2 totalClickAdsPerDay">${bot.totalClickAdsPerDay.toLocaleString()}</span></li>
                    <li class="d-flex align-items-center"><i class="ti ti-exclamation-circle ti-sm text-secondary"></i><span class="text-muted mx-2 totalErrorPerDay">${bot.totalErrorPerDay.toLocaleString()}</span></li>
                  </ul>
                </div>
                <div class="col-8">
                <ul class="list-unstyled">
                    <li class="d-flex align-items-center mb-2"><i class="ti ti-network ti-sm text-secondary"></i><span class="text-muted mx-2 network">${
                      bot.network
                    }</span></li>
                    <li class="d-flex align-items-center mb-2"><i class="ti ti-clock ti-sm text-secondary"></i><span class="text-muted mx-2 uptime">${
                      bot.uptime
                    }</span></li>
                    <li class="d-flex align-items-center mb-2"><i class="ti ti-activity ti-sm text-secondary"></i><span class="text-muted mx-2 lastActivity">${moment(
                      bot.lastActivity
                    ).fromNow()}</span></li>
                    <li class="d-flex align-items-center bot-delete" data-id="${
                      bot._id
                    }"><i class="ti ti-trash ti-sm text-secondary"></i><span class="text-muted mx-2">Delete</span></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>`);
      });
    }
  }

  function setIsPaused(bot) {
    return bot.isStarted
      ? '<i class="ti ti-player-pause ti-sm text-danger"></i>'
      : '<i class="ti ti-player-play ti-sm text-success"></i>';
  }

  function setIsActive(bot) {
    return bot.isActive
      ? ' <span class="badge badge-dot bg-success me-1"></span>' + '<small class="text-muted">Online</small>'
      : '<span class="badge badge-dot bg-danger me-1"></span>' + '<small class="text-muted">Offline</small>';
  }

  function searchArray(array, searchTerm) {
    const properties = ['ip', 'country', 'network'];
    return array.filter((item) => {
      return properties.some((prop) => {
        if (item[prop] && typeof item[prop] === 'string') {
          return item[prop].toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    });
  }
});
