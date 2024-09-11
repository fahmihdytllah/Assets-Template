$(document).ready(function () {
  let select2 = $('.select2'),
    elementListBots = $('#listBots'),
    socket = io(),
    localDataBot = [],
    showBots = {},
    uptimeBots = {},
    uptimeSeconds = {};

  /** Select Default */
  if (select2.length) {
    select2.each(function () {
      var $this = $(this);
      $this.wrap('<div class="position-relative"></div>').select2({
        placeholder: 'Select value',
        dropdownParent: $this.parent(),
      });
    });
  }

  graphDataBot();

  /** Socket server */
  setTimeout(() => {
    socket.emit('requestSystemStats', userId);
  }, 5000);

  socket.on('connect', () => {
    socket.emit('clientJoin', userId);
  });

  socket.on('clientConnected', (bot) => {
    const findBot = localDataBot?.find((q) => q._id === bot._id);
    if (findBot) {
      if (!findBot.isActive) {
        toastr.success('Bot ' + bot.ip + ' is active again', 'Bot is active again!');
      }

      const elementBot = $('#bot-' + bot._id);
      elementListBots.prepend(elementBot);
      elementBot.find('.bot-status').html(setIsActive(bot));
      elementBot.find('.bot-stop').html(setIsPaused(bot));
    } else {
      localDataBot.push(bot);
      elementListBots.prepend(paternBot(bot));
      toastr.success('New bots have been added: ' + bot.ip, 'New bot added!');
    }
  });

  socket.on('stopedBot', (bot) => {
    /** Update local array */
    const indexBot = localDataBot?.findIndex((item) => item._id === bot._id);
    if (indexBot !== -1) {
      localDataBot[indexBot] = { ...localDataBot[indexBot], ...bot };
      const elementBot = $('#bot-' + bot._id);
      elementBot.find('.bot-stop').html(setIsPaused(bot));
    }
  });

  socket.on('updatedBot', (bot) => {
    const indexBot = localDataBot?.findIndex((item) => item._id === bot._id);
    if (indexBot !== -1) {
      /** Update local array */
      const oldBot = localDataBot[indexBot];
      localDataBot[indexBot] = { ...localDataBot[indexBot], ...bot };

      /** Update Views */
      const elementBot = $('#bot-' + bot._id);
      if (elementBot) {
        if (bot.isActive) {
          animateChange(elementBot.find('.totalHitsPerDay'), oldBot.totalHitsPerDay, bot.totalHitsPerDay);
          animateChange(elementBot.find('.totalClickAdsPerDay'), oldBot.totalClickAdsPerDay, bot.totalClickAdsPerDay);
          animateChange(elementBot.find('.totalViewAdsPerDay'), oldBot.totalViewAdsPerDay, bot.totalViewAdsPerDay);
          animateChange(elementBot.find('.totalErrorPerDay'), oldBot.totalErrorPerDay, bot.totalErrorPerDay);
          elementBot.find('.lastActivity').html(moment(bot.lastActivity).fromNow());
        } else {
          elementListBots.append(elementBot);
          toastr.warning('Bot ' + bot.ip + ' is currently inactive', 'Bot not active!');
        }

        elementBot.find('.bot-status').html(setIsActive(bot));
        elementBot.find('.bot-stop').html(setIsPaused(bot));
        setUptime(bot);
      }
    }
  });

  socket.on('clientSystemStats', (data) => {
    const indexBot = localDataBot?.findIndex((item) => item._id === bot._id);
    if (indexBot !== -1) {
      /** Update local array */
      localDataBot[indexBot] = { ...localDataBot[indexBot], ...bot };

      /** Update Views */
      const elementBot = $('#bot-' + data._id);
      if (elementBot) {
        elementBot.find('.cpu').text(data.cpuUsage + '%');
        elementBot.find('.memory').text(data.memoryUsage + '%');
      }
    }
  });

  socket.on('clientMessage', (data) => {
    toastr[data.type](data.message, data.title);
  });

  /** Events jquery */
  /** Request Stop bot  */
  $(document).on('click', '.bot-stop', function () {
    const id = $(this).data('id');
    const findBot = localDataBot?.find((item) => item._id === id);
    if (findBot) {
      Swal.fire({
        title: findBot.isStarted ? 'Stop Bot' : 'Run Bot',
        text: findBot.isStarted ? 'Are you sure you want to stop this bot?' : 'Are you sure you want to run this bot?',
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
          socket.emit('requestStop', findBot);
        }
      });
    }
  });

  /** Request Restart bot  */
  $(document).on('click', '.bot-restart', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: 'Restart Bot',
      text: 'Are you sure you want to restart this bot?',
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
        const findBot = localDataBot?.find((item) => item._id === id);
        if (findBot) {
          socket.emit('requestRestart', findBot);
        }
      }
    });
  });

  /** Request Reboot server  */
  $(document).on('click', '.server-reboot', function () {
    const id = $(this).data('id');
    Swal.fire({
      title: 'Reboot Server',
      text: 'Are you sure you want to reboot this server bot?',
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
        const findBot = localDataBot?.find((item) => item._id === id);
        if (findBot) {
          socket.emit('requestReboot', findBot);
        }
      }
    });
  });

  /** Delete bot */
  $(document).on('click', '.bot-delete', function () {
    let $this = $(this);
    let idBot = $this.data('id');

    Swal.fire({
      title: 'Remove Bot',
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
        deleteBot(idBot);
      }
    });
  });

  /** Hide show details */
  $(document).on('click', '.bot-detail', function () {
    let id = $(this).data('id');

    if (typeof showBots[id] === 'undefined') {
      showBots[id] = false;
    }

    if (showBots[id]) {
      $(this).html('<i class="ti ti-stack-push ti-sm text-info"></i>');
    } else {
      $(this).html('<i class="ti ti-stack-pop ti-sm text-info"></i>');
    }

    showBots[id] = !showBots[id];
  });

  /** Search bot */
  $('.search-bot').on('input', function () {
    const searchTerm = $(this).val();
    $('#loadingBots').show();
    const results = searchArray(localDataBot, searchTerm);
    loadBots(results);
  });

  /** Filtered bot */
  $('#filtered').change(function () {
    let term = $(this).val();
    let type = $(this).find('option:selected').data('type');
    let filteredData = [];

    /** Filtered data */
    if (type === 'byKey') {
      filteredData = localDataBot?.filter((item) => item.keyName === term);
    } else if (type === 'byActive') {
      term = term === 'online' ? true : false;
      filteredData = localDataBot?.filter((item) => item.isActive === term);
    } else if (type === 'byStats') {
      filteredData = localDataBot?.sort(function (a, b) {
        return b[term] - a[term];
      });
    } else if (type === 'byCountry') {
      filteredData = localDataBot?.sort(function (a, b) {
        let countryA = a.country.toLowerCase();
        let countryB = b.country.toLowerCase();
        return countryA.localeCompare(countryB);
      });
    } else {
      filteredData = localDataBot;
    }

    /** Display data */
    loadBots(filteredData);
  });

  function graphDataBot() {
    $('#loadingBots').show();

    $.get('?type=json', function (res) {
      $('#loadingBots').hide();
      localDataBot = res.data;
      loadBots(localDataBot);

      /** Display Catgory total */
      let categoryTotals = getCategoryTotals(localDataBot);
      populateCategoryFilter(categoryTotals);
    });
  }

  function loadBots(data) {
    elementListBots.html('');
    $('#loadingBots').hide();

    if (data?.length === 0) {
      elementListBots.html(`<div class="col-md-12">
          <div class="bg-lighter rounded p-3 mb-3 position-relative">
            <span class="text-muted">Oops, it seems the bot was not found...
          </div>
        </div>`);
    } else {
      data.forEach((bot) => {
        elementListBots.append(paternBot(bot));
      });
    }
  }

  function paternBot(bot) {
    setUptime(bot);

    return `<div class="col-12 col-md-6 col-lg-4 col-xxl-3 mb-3" id="bot-${bot._id}">
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
            <span class="bot-stop me-2" data-id="${bot._id}">${setIsPaused(bot)}</span>
            <span class="bot-detail me-2" data-id="${
              bot._id
            }" data-bs-toggle="collapse" data-bs-target="#detail-${bot._id}" aria-expanded="false" aria-controls="detail-${bot._id}"><i class="ti ti-stack-push ti-sm text-info"></i></span>
            <div class="dropdown dropend">
              <button type="button" class="btn p-0 dropdown-toggle hide-arrow" data-bs-toggle="dropdown">
                <i class="ti ti-dots-vertical"></i>
              </button>
              <div class="dropdown-menu">
                <button class="dropdown-item server-reboot" data-id="${
                  bot._id
                }"><i class="ti ti-server-2 me-1"></i> Reboot</button>
                <button class="dropdown-item bot-restart" data-id="${
                  bot._id
                }"><i class="ti ti-rotate me-1"></i> Restart</button>
                <hr class="dropdown-divider">
                <button class="dropdown-item bot-delete text-danger" data-id="${
                  bot._id
                }"><i class="ti ti-trash me-1"></i> Delete</button>
              </div>
            </div>
          </div>
        </div>
        <div class="collapse mt-3 ${showBots[bot._id] ? '' : 'show'}" id="detail-${bot._id}">
          <ul class="list-unstyled row">
            <div class="col-4">
              <li class="d-flex align-items-center mb-2" data-type="tooltip" data-text="CPU Usage"><i class="ti ti-cpu ti-sm "></i><span class="text-muted mx-2 cpu">${
                bot.cpuUsage
              }%</span></li>
              <li class="d-flex align-items-center mb-2" data-type="tooltip" data-text="Visitors"><i class="ti ti-users ti-sm "></i><span class="text-muted mx-2 totalHitsPerDay">${bot.totalHitsPerDay.toLocaleString()}</span></li>
              <li class="d-flex align-items-center mb-2" data-type="tooltip" data-text="Ad Views"><i class="ti ti-ad ti-sm "></i><span class="text-muted mx-2 totalViewAdsPerDay">${bot.totalViewAdsPerDay.toLocaleString()}</span></li>
              <li class="d-flex align-items-center mb-2" data-type="tooltip" data-text="Ad Clicks"><i class="ti ti-click ti-sm "></i><span class="text-muted mx-2 totalClickAdsPerDay">${bot.totalClickAdsPerDay.toLocaleString()}</span></li>
              <li class="d-flex align-items-center" data-type="tooltip" data-text="Errors"><i class="ti ti-exclamation-circle ti-sm "></i><span class="text-muted mx-2 totalErrorPerDay">${bot.totalErrorPerDay.toLocaleString()}</span></li>
            </div>
            <div class="col-8">
              <li class="d-flex align-items-center mb-2" data-type="tooltip" data-text="Memory Usage"><i class="ti ti-server ti-sm "></i><span class="text-muted mx-2 memory">${
                bot.memoryUsage
              }%</span></li>
              <li class="d-flex align-items-center mb-2" data-type="tooltip" data-text="Access Key"><i class="ti ti-key ti-sm "></i><span class="text-muted mx-2 key">${
                bot.keyName
              }</span></li>
              <li class="d-flex align-items-center mb-2" data-type="tooltip" data-text="Uptime"><i class="ti ti-clock ti-sm "></i><span class="text-muted mx-2 uptime">${formatTime(
                bot.uptime
              )}</span></li>
              <li class="d-flex align-items-center mb-2" data-type="tooltip" data-text="Last Activity"><i class="ti ti-activity ti-sm "></i><span class="text-muted mx-2 lastActivity">${moment(
                bot.lastActivity
              ).fromNow()}</span></li>
              <li class="d-flex align-items-center" data-type="tooltip" data-text="Network"><i class="ti ti-network ti-sm "></i><span class="text-muted mx-2 network">${
                bot.network
              }</span></li>
            </div>
          </ul>
        </div>
      </div>
    </div>`;
  }

  function deleteBot(id) {
    $.blockUI({
      message: itemLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.ajax({
      url: '?id=' + id,
      type: 'DELETE',
      success: function (res) {
        $.unblockUI();
        $('#bot-' + id).remove();

        const indexBot = localDataBot.findIndex(({ id }) => id === id);
        if (indexBot !== -1) {
          localDataBot.splice(indexBot, 1);
        }

        toastr.success(res.msg, 'Good Job!');
      },
      error: function (e) {
        $.unblockUI();
        let msg = e.responseJSON?.msg;
        toastr.success(msg ? msg : 'There is an error!', 'Good Job!');
      },
    });
  }

  function setIsPaused(bot) {
    return bot.isStarted
      ? '<i class="ti ti-player-pause ti-sm text-danger"></i>'
      : '<i class="ti ti-player-play ti-sm text-success"></i>';
  }

  function setIsActive(bot) {
    return bot.isActive
      ? ' <span class="blinking badge badge-dot bg-success me-1"></span>' + '<small class="text-muted">online</small>'
      : '<span class="badge badge-dot bg-danger me-1"></span>' + '<small class="text-muted">offline</small>';
  }

  function searchArray(array, searchTerm) {
    const properties = ['ip', 'country', 'network', 'keyName'];
    return array.filter((item) => {
      return properties.some((prop) => {
        if (item[prop] && typeof item[prop] === 'string') {
          return item[prop].toLowerCase().includes(searchTerm.toLowerCase());
        }
        return false;
      });
    });
  }

  function animateChange(element, startValue, finalValue) {
    const difference = Math.abs(finalValue - startValue);
    const duration = difference * 50;
    const startTime = performance.now();

    function updateNumber(currentTime) {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const currentNumber = Math.floor(progress * finalValue);

      element.text(currentNumber.toLocaleString());

      if (progress < 1) {
        requestAnimationFrame(updateNumber);
      }
    }

    requestAnimationFrame(updateNumber);
  }

  function updateUptime(bot) {
    uptimeSeconds[bot._id] += 1;
    const elementBot = $('#bot-' + bot._id);
    elementBot.find('.uptime').text(formatTime(uptimeSeconds[bot._id]));
  }

  function setUptime(bot) {
    if (bot.isActive) {
      if (uptimeSeconds[bot._id] === undefined) {
        uptimeSeconds[bot._id] = parseFloat(bot.uptime);
      }

      if (uptimeBots[bot._id] !== undefined) {
        clearInterval(uptimeBots[bot._id]);
      }

      uptimeBots[bot._id] = setInterval(function () {
        updateUptime(bot);
      }, 1000);
    } else {
      if (uptimeBots[bot._id] !== undefined) {
        clearInterval(uptimeBots[bot._id]);
      }
    }
  }

  function formatTime(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return `${hrs}h ${mins}m ${secs}s`;
  }

  function getCategoryTotals(items) {
    let categoryTotals = {};

    items.forEach(function (item) {
      if (categoryTotals[item.keyName]) {
        categoryTotals[item.keyName]++;
      } else {
        categoryTotals[item.keyName] = 1;
      }
    });

    return categoryTotals;
  }

  function populateCategoryFilter(categoryTotals) {
    let $select = $('#byKey');
    for (let category in categoryTotals) {
      $select.append(
        '<option value="' +
          category +
          '" data-type="byKey">' +
          category +
          ' (' +
          categoryTotals[category] +
          ') </option>'
      );
    }
  }
});
