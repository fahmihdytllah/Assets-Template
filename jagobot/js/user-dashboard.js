$.fn.extend({
  loaderHide: function () {
    this.removeClass('d-flex').addClass('d-none');
  },
  loaderShow: function () {
    this.removeClass('d-none').addClass('d-flex');
  },
});

$(document).ready(function () {
  const btnLoginAdsense = $('.btn-login-adsense');

  let cardColor, headingColor, legendColor, labelColor, borderColor;

  if (isDarkStyle) {
    cardColor = config.colors_dark.cardColor;
    labelColor = config.colors_dark.textMuted;
    legendColor = config.colors_dark.bodyColor;
    headingColor = config.colors_dark.headingColor;
    borderColor = config.colors_dark.borderColor;
  } else {
    cardColor = config.colors.cardColor;
    labelColor = config.colors.textMuted;
    legendColor = config.colors.bodyColor;
    headingColor = config.colors.headingColor;
    borderColor = config.colors.borderColor;
  }

  const growthColors = {
    up: { class: 'success', icon: '+' },
    down: { class: 'danger', icon: '' },
    '-': { class: 'secondary', icon: '-' },
  };

  /** Load Statistics */
  loadStatistics();

  /** Load Weekly Summary */
  loadWeeklySummary();

  $('.btn-refresh-weekly').click(function () {
    loadWeeklySummary();
  });

  /** Load Yearly Summary */
  loadEarningReportYearly();

  $('.btn-refresh-yearly').click(function () {
    loadEarningReportYearly();
  });

  /** Load Earning Platform */
  loadChartPlatform();

  $('.btn-refresh-platform').click(function () {
    loadChartPlatform();
  });

  /** Load Earning Country */
  loadChartCountry();

  $('.btn-refresh-country').click(function () {
    loadChartCountry();
  });

  /**
   * Grant Access Google Adsense
   */
  if (btnLoginAdsense) {
    btnLoginAdsense.click(function () {
      thirdPartyAccess('google-adsense', {
        onSuccess: (res) => {
          Swal.fire({
            title: 'Good News!',
            text: res.msg,
            icon: 'success',
            customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          }).then(() => location.reload());
        },
        onError: (err) => {
          Swal.fire({
            title: 'Bad News!',
            text: err.msg,
            icon: 'error',
            customClass: { confirmButton: 'btn btn-primary waves-effect waves-light' },
          });
        },
      });
    });
  }

  /**
   * System Statistics
   */
  function loadStatistics() {
    const statistics = $('#statistics');
    const statisticsLoader = $('#statisticsLoader');

    statistics.hide();
    statisticsLoader.loaderShow();

    $.get('/api/system-statistics', function ({ data }) {
      statistics.show();
      statisticsLoader.loaderHide();

      $('.total-visitors').html(formatNumber(data.totalHits));
      $('.total-servers').html(formatNumber(data.totalBots));
      $('.total-keys').html(formatNumber(data.totalKeys));
      $('.total-errors').html(formatNumber(data.totalErrors));
    });
  }

  /**
   *  Earnings Weekly
   */
  function loadWeeklySummary() {
    const weeklySummaryChart = $('#weeklySummaryChart');
    const weeklySummaryLoader = $('#weeklySummaryLoader');
    const weeklyOverview = $('#weeklyOverview');
    const weeklyOverviewLoader = $('#weeklyOverviewLoader');
    const earningsToday = $('#earningsToday');
    const earningsTodayLoader = $('#earningsTodayLoader');
    const weeklySummaryChartE1 = document.querySelector('#weeklySummaryChart');

    earningsTodayLoader.loaderShow();
    weeklySummaryLoader.loaderShow();
    weeklyOverviewLoader.loaderShow();
    weeklySummaryChart.hide();
    weeklyOverview.hide();

    $.get('/api/earnings-weekly', function ({ status, data }) {
      earningsTodayLoader.loaderHide();
      weeklySummaryLoader.loaderHide();
      weeklyOverviewLoader.loaderHide();
      weeklySummaryChart.show();
      weeklyOverview.show();
      weeklySummaryChart.html('');

      if (!status) {
        weeklySummaryChart.html('<span class="text-muted">Please log in to your Adsense account first.<span>');
        weeklyOverview.html('<span class="text-muted">Please log in to your Adsense account first.<span>');
        earningsToday.html('<p class="text-heading mb-3 mt-1">--</p>');
        return;
      }

      $('.earning-this-week').html(formatCurrency(data.weekly.earnings));
      $('.progress-weekly').css({ width: data.weekly.progress });
      $('.earning-average').html(formatCurrency(data.daily.average));
      $('.progress-daily').css({ width: data.daily.progress });

      $('.weekly-growth').html(
        '<span class="text-' +
          growthColors[data.weekly.growth.status].class +
          '">' +
          '<i class="ti ti-chevron-' +
          data.weekly.growth.status +
          ' me-1"></i>' +
          data.weekly.growth.value +
          '</span>'
      );

      earningsToday.html(
        '<p class="text-heading mb-3 mt-1">' +
          formatCurrency(data.daily.earnings) +
          '</p>' +
          '<div>' +
          '<span class="badge bg-label-' +
          growthColors[data.daily.growth.status].class +
          '">' +
          data.daily.growth.value +
          '</span>' +
          '</div>'
      );

      const chartConfig = {
        chart: {
          height: 300,
          type: 'area',
          toolbar: false,
          dropShadow: {
            enabled: true,
            top: 18,
            left: 2,
            blur: 3,
            color: config.colors.primary,
            opacity: 0.15,
          },
        },
        markers: {
          size: 6,
          colors: 'transparent',
          strokeColors: 'transparent',
          strokeWidth: 4,
          discrete: [
            {
              fillColor: cardColor,
              seriesIndex: 0,
              dataPointIndex: data.weekly.largestIndex,
              strokeColor: config.colors.primary,
              strokeWidth: 4,
              size: 6,
              radius: 2,
            },
          ],
          hover: { size: 7 },
        },
        series: [
          {
            name: 'Earnings',
            data: data.weekly.series,
          },
        ],
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: 'smooth',
          lineCap: 'round',
        },
        colors: [config.colors.primary],
        fill: {
          type: 'gradient',
          gradient: {
            shade: isDarkStyle,
            shadeIntensity: 0.8,
            opacityFrom: 0.7,
            opacityTo: 0.25,
            stops: [0, 95, 100],
          },
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return formatCurrency(val);
            },
          },
        },
        grid: {
          show: true,
          borderColor: borderColor,
          padding: {
            top: 0,
            bottom: 0,
            left: 5,
            right: 0,
          },
        },
        xaxis: {
          categories: data.weekly.labels,
          labels: {
            offsetX: 0,
            formatter: function (val) {
              return formatDate(val);
            },
            style: {
              colors: labelColor,
              fontSize: '13px',
            },
          },
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          lines: {
            show: false,
          },
        },
        yaxis: {
          labels: {
            offsetX: -7,
            formatter: function (val) {
              return formatNumber(val);
            },
            style: {
              fontSize: '13px',
              colors: labelColor,
              fontFamily: 'Public Sans',
            },
          },
          min: 0,
          tickAmount: 5,
        },
      };

      if (typeof weeklySummaryChartE1 !== undefined && weeklySummaryChartE1 !== null) {
        const weeklySummaryChart = new ApexCharts(weeklySummaryChartE1, chartConfig);
        weeklySummaryChart.render();
      }
    });
  }

  /**
   *  Earning by Platform
   */
  function loadChartPlatform() {
    const earningPlatformChart = $('#earningPlatformChart');
    const earningPlatformLoader = $('#earningPlatformLoader');

    earningPlatformLoader.loaderShow();
    earningPlatformChart.hide();

    $.get('/api/earnings-by-platform', function ({ status, data }) {
      earningPlatformLoader.loaderHide();
      earningPlatformChart.show();
      earningPlatformChart.html('');

      if (!status) {
        earningPlatformChart.html('<span class="text-muted">Please log in to your Adsense account first.<span>');
        return;
      }

      const earningPlatformChartE1 = document.querySelector('#earningPlatformChart');
      const total = data.series.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

      const earningPlatformChartConfig2 = {
        chart: {
          height: 350,
          parentHeightOffset: 0,
          type: 'donut',
        },
        labels: data.labels,
        series: data.series,
        colors: ['#7367f0', '#8f7df3', '#a894f7', '#beacfa', '#d3c4fc', '#e7ddff'],
        stroke: {
          width: 0,
        },
        dataLabels: {
          enabled: false,
          formatter: function (val, opt) {
            return ((val / total) * 100).toFixed(1) + '%';
          },
        },
        legend: {
          show: true,
          position: 'bottom',
          offsetY: 10,
          markers: {
            width: 8,
            height: 8,
            offsetX: -3,
          },
          itemMargin: {
            horizontal: 15,
            vertical: 5,
          },
          fontSize: '13px',
          fontFamily: 'Public Sans',
          fontWeight: 400,
          labels: {
            colors: headingColor,
            useSeriesColors: false,
          },
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return formatCurrency(val);
            },
          },
        },
        grid: {
          padding: {
            top: 15,
          },
        },
        plotOptions: {
          pie: {
            donut: {
              size: '75%',
              labels: {
                show: true,
                value: {
                  fontSize: '26px',
                  fontFamily: 'Public Sans',
                  color: headingColor,
                  fontWeight: 500,
                  offsetY: -30,
                  formatter: function (val) {
                    return ((val / total) * 100).toFixed(0) + '%';
                  },
                },
                name: {
                  offsetY: 20,
                  fontFamily: 'Public Sans',
                },
                total: {
                  show: true,
                  fontSize: '0.9rem',
                  label: data.labels[0],
                  color: labelColor,
                  formatter: function (w) {
                    return ((data.series[0] / total) * 100).toFixed(0) + '%';
                  },
                },
              },
            },
          },
        },
        responsive: [
          {
            breakpoint: 1025,
            options: {
              chart: {
                height: 380,
              },
            },
          },
          {
            breakpoint: 420,
            options: {
              chart: {
                height: 300,
              },
            },
          },
        ],
      };

      const earningPlatformChartConfig = {
        chart: {
          height: 250,
          parentHeightOffset: 0,
          type: 'donut',
        },
        labels: data.labels,
        series: data.series,
        colors: ['#7367f0', '#8f7df3', '#a894f7', '#beacfa', '#d3c4fc', '#e7ddff'],
        stroke: {
          width: 0,
        },
        dataLabels: {
          enabled: false,
          formatter: function (val, opt) {
            return ((val / total) * 100).toFixed(1) + '%';
          },
        },
        legend: {
          show: true,
          position: 'right',
          offsetX: -10,
          offsetY: 0,
          markers: {
            width: 8,
            height: 8,
            offsetX: -3,
          },
          itemMargin: {
            horizontal: 10,
            vertical: 5,
          },
          fontSize: '13px',
          fontFamily: 'Public Sans',
          fontWeight: 400,
          labels: {
            colors: headingColor,
            useSeriesColors: false,
          },
        },
        tooltip: {
          theme: false,
        },
        grid: {
          padding: {
            top: 10,
            bottom: 0,
            left: 0,
            right: 0,
          },
        },
        plotOptions: {
          pie: {
            donut: {
              size: '70%', // Perkecil ukuran chart donut
              labels: {
                show: true,
                value: {
                  fontSize: '20px',
                  fontFamily: 'Public Sans',
                  color: headingColor,
                  fontWeight: 500,
                  offsetY: -20,
                  formatter: function (val) {
                    return ((val / total) * 100).toFixed(0) + '%';
                  },
                },
                name: {
                  offsetY: 30,
                  fontFamily: 'Public Sans',
                },
                total: {
                  show: true,
                  fontSize: '14px',
                  fontFamily: 'Public Sans',
                  color: legendColor,
                  label: data.labels[0],
                  formatter: function (w) {
                    return ((data.series[0] / total) * 100).toFixed(0) + '%';
                  },
                },
              },
            },
          },
        },
        responsive: [
          {
            breakpoint: 768, // Tablet
            options: {
              chart: {
                height: 240,
              },
              legend: {
                position: 'bottom', // Pindahkan legend ke bawah
                offsetY: 5,
              },
            },
          },
          {
            breakpoint: 480, // Mobile
            options: {
              chart: {
                height: 220, // Sesuaikan ukuran chart
              },
              legend: {
                position: 'bottom',
                offsetY: 5,
                itemMargin: {
                  horizontal: 8,
                  vertical: 3,
                },
              },
            },
          },
        ],
      };

      if (typeof earningPlatformChartE1 !== undefined && earningPlatformChartE1 !== null) {
        const earningPlatformChart = new ApexCharts(earningPlatformChartE1, earningPlatformChartConfig2);
        earningPlatformChart.render();
      }
    });
  }

  /**
   *  Earnings Yearly and Monthly
   */
  function loadEarningReportYearly() {
    const earningYearlyChart = $('#earningYearlyChart');
    const earningYearlyLoader = $('#earningYearlyLoader');
    const earningsThisMonth = $('#earningsThisMonth');
    const earningsThisMonthLoader = $('#earningsThisMonthLoader');
    const earningYearlyChartEl = document.querySelector('#earningYearlyChart');

    earningYearlyLoader.loaderShow();
    earningsThisMonthLoader.loaderShow();
    earningYearlyChart.hide();
    earningsThisMonth.hide();
    earningYearlyChart.html('');

    $.get('/api/earnings-yearly', function ({ status, data }) {
      earningYearlyLoader.loaderHide();
      earningsThisMonthLoader.loaderHide();
      earningYearlyChart.show();
      earningsThisMonth.show();

      if (!status) {
        earningYearlyChart.html('<span class="text-muted">Please log in to your Adsense account first.<span>');
        earningsThisMonth.html('<p class="text-heading mb-3 mt-1">--</p>');
        return;
      }

      earningsThisMonth.html(
        '<p class="text-heading mb-3 mt-1">' +
          formatCurrency(data.monthly.earnings) +
          '</p>' +
          '<div>' +
          '<span class="badge bg-label-' +
          growthColors[data.monthly.growth.status].class +
          '">' +
          data.monthly.growth.value +
          '</span>' +
          '</div>'
      );

      const earningYearlyChartConfig = EarningReportsBarChart(
        data.yearly.series,
        data.yearly.labels,
        data.yearly.largestIndex
      );

      if (typeof earningYearlyChartEl !== undefined && earningYearlyChartEl !== null) {
        const earningYearlyChart = new ApexCharts(earningYearlyChartEl, earningYearlyChartConfig);
        earningYearlyChart.render();
      }
    });
  }

  /**
   *  Earning by Country
   */
  function loadChartCountry() {
    const earningCountryChart = $('#earningCountryChart');
    const earningCountryLoader = $('#earningCountryLoader');

    earningCountryLoader.loaderShow();
    earningCountryChart.hide();

    $.get('/api/earnings-by-country', function ({ status, data }) {
      earningCountryLoader.loaderHide();
      earningCountryChart.show();
      earningCountryChart.html('');

      if (!status) {
        earningCountryChart.html('<span class="text-muted">Please log in to your Adsense account first.<span>');
        return;
      }

      const earningCountryChartE1 = document.querySelector('#earningCountryChart');
      const total = data.series.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

      const earningCountryChartConfig = {
        chart: {
          height: 250,
          parentHeightOffset: 0,
          type: 'donut',
        },
        labels: data.labels,
        series: data.series,
        colors: ['#7367f0', '#8f7df3', '#a894f7', '#beacfa', '#d3c4fc', '#e7ddff'],
        stroke: {
          width: 0,
        },
        dataLabels: {
          enabled: false,
          formatter: function (val, opt) {
            return ((val / total) * 100).toFixed(1) + '%';
          },
        },
        legend: {
          show: true,
          position: 'right',
          offsetX: -10,
          offsetY: 0,
          markers: {
            width: 8,
            height: 8,
            offsetX: -3,
          },
          itemMargin: {
            horizontal: 10,
            vertical: 5,
          },
          fontSize: '13px',
          fontFamily: 'Public Sans',
          fontWeight: 400,
          labels: {
            colors: headingColor,
            useSeriesColors: false,
          },
        },
        tooltip: {
          y: {
            formatter: function (val) {
              return formatCurrency(val);
            },
          },
        },
        grid: {
          padding: {
            top: 10,
            bottom: 0,
            left: 0,
            right: 0,
          },
        },
        plotOptions: {
          pie: {
            donut: {
              size: '70%', // Perkecil ukuran chart donut
              labels: {
                show: true,
                value: {
                  fontSize: '20px',
                  fontFamily: 'Public Sans',
                  color: headingColor,
                  fontWeight: 500,
                  offsetY: -20,
                  formatter: function (val) {
                    return ((val / total) * 100).toFixed(0) + '%';
                  },
                },
                name: {
                  offsetY: 30,
                  fontFamily: 'Public Sans',
                },
                total: {
                  show: true,
                  fontSize: '14px',
                  fontFamily: 'Public Sans',
                  color: legendColor,
                  label: data.labels[0],
                  formatter: function (w) {
                    return ((data.series[0] / total) * 100).toFixed(0) + '%';
                  },
                },
              },
            },
          },
        },
        responsive: [
          {
            breakpoint: 768, // Tablet
            options: {
              chart: {
                height: 240,
              },
              legend: {
                position: 'bottom', // Pindahkan legend ke bawah
                offsetY: 5,
              },
            },
          },
          {
            breakpoint: 480, // Mobile
            options: {
              chart: {
                height: 220, // Sesuaikan ukuran chart
              },
              legend: {
                position: 'bottom',
                offsetY: 5,
                itemMargin: {
                  horizontal: 8,
                  vertical: 3,
                },
              },
            },
          },
        ],
      };

      if (typeof earningCountryChartE1 !== undefined && earningCountryChartE1 !== null) {
        const earningCountryChart = new ApexCharts(earningCountryChartE1, earningCountryChartConfig);
        earningCountryChart.render();
      }
    });
  }

  function formatDate(dateString) {
    const options = { month: 'short', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', options);
  }

  function formatMonth(dateString) {
    const date = new Date(`${dateString}-01`);
    const formattedDate = new Intl.DateTimeFormat('en-US', {
      month: 'short',
    }).format(date);

    return formattedDate;
  }

  function formatCurrency(amount) {
    const locale = navigator.language || 'id-ID';
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
    });
    return formatter.format(amount);
  }

  function formatNumber(value) {
    if (value >= 1e9) {
      return (value / 1e9).toFixed(1) + 'B'; // Billion
    } else if (value >= 1e6) {
      return (value / 1e6).toFixed(1) + 'M'; // Million
    } else if (value >= 1e3) {
      return (value / 1e3).toFixed(0) + 'K'; // Thousand
    } else {
      return value.toString();
    }
  }

  /**
   *  Earning Reports Tabs Function
   */
  function EarningReportsBarChart(series, labels, largestIndex) {
    const basicColor = config.colors_label.primary,
      highlightColor = config.colors.primary;
    var colorArr = [];

    for (let i = 0; i < series.length; i++) {
      if (i === largestIndex) {
        colorArr.push(highlightColor);
      } else {
        colorArr.push(basicColor);
      }
    }

    const earningReportBarChartOpt = {
      chart: {
        height: 258,
        parentHeightOffset: 0,
        type: 'bar',
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          columnWidth: '32%',
          startingShape: 'rounded',
          borderRadius: 7,
          distributed: true,
          dataLabels: {
            position: 'top',
          },
        },
      },
      grid: {
        show: false,
        padding: {
          top: 0,
          bottom: 0,
          left: -10,
          right: -10,
        },
      },
      colors: colorArr,
      dataLabels: {
        enabled: true,
        formatter: function (val) {
          return formatNumber(val);
        },
        offsetY: -25,
        style: {
          fontSize: '15px',
          colors: [legendColor],
          fontWeight: '600',
          fontFamily: 'Public Sans',
        },
      },
      series: [
        {
          data: series,
        },
      ],
      legend: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      xaxis: {
        categories: labels,
        axisBorder: {
          show: true,
          color: borderColor,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          formatter: function (val) {
            return formatMonth(val);
          },
          style: {
            colors: labelColor,
            fontSize: '13px',
            fontFamily: 'Public Sans',
          },
        },
      },
      yaxis: {
        labels: {
          offsetX: -15,
          formatter: function (val) {
            return formatNumber(parseInt(val));
          },
          style: {
            fontSize: '13px',
            colors: labelColor,
            fontFamily: 'Public Sans',
          },
          min: 0,
          max: 60000,
          tickAmount: 6,
        },
      },
      responsive: [
        {
          breakpoint: 1441,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '41%',
              },
            },
          },
        },
        {
          breakpoint: 590,
          options: {
            plotOptions: {
              bar: {
                columnWidth: '61%',
                borderRadius: 5,
              },
            },
            yaxis: {
              labels: {
                show: false,
              },
            },
            grid: {
              padding: {
                right: 0,
                left: -20,
              },
            },
            dataLabels: {
              style: {
                fontSize: '12px',
                fontWeight: '400',
              },
            },
          },
        },
      ],
    };

    return earningReportBarChartOpt;
  }
});
