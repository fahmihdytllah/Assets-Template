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

  // Chart Colors
  const chartColors = {
    donut: {
      series1: '#ce9ffc',
      series2: '#7367f0',
      series3: '#362d92',
      series4: '#8f85f3',
    },
    bar: {
      series1: config.colors.primary,
      series2: '#7367F0CC',
      series3: '#7367f099',
    },
  };

  // load data analystic
  loadStatistik();
  loadEarningReportYearly();

  /** Load Earning Platform */
  loadChartPlatform();

  /** Load Earning Country */
  loadChartCountry();

  $('.btn-refresh').click(function () {
    loadEarningReportYearly();
    loadStatistik();
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

  // Earning Reports Tabs Function
  function EarningReportsBarChart(arrayData, arrayCategory, highlightData) {
    const basicColor = config.colors_label.primary,
      highlightColor = config.colors.primary;
    var colorArr = [];

    for (let i = 0; i < arrayData.length; i++) {
      if (i === highlightData) {
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
          data: arrayData,
        },
      ],
      legend: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      xaxis: {
        categories: arrayCategory,
        axisBorder: {
          show: true,
          color: borderColor,
        },
        axisTicks: {
          show: false,
        },
        labels: {
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

  // Earning Reports Tabs Profit
  // --------------------------------------------------------------------
  function loadEarningReportYearly() {
    $('.loaderEarning').loaderShow();
    $('#earningReportYearly').hide();
    $('#earningReportMonthly').hide();
    $('.incomeToday').hide();
    $('.incomeThisMonth').hide();

    $.get('/api/dashboard?type=earningReportYearly', function (d) {
      $('.loaderEarning').loaderHide();
      $('#earningReportYearly').show();
      $('#earningReportMonthly').show();
      $('.incomeToday').show();
      $('.incomeThisMonth').show();

      if (d?.incomeToday) {
        $('.incomeToday').html(`<p class="mb-2 mt-1">${formatNumber(d.incomeToday.income)}</p>
          <div class="pt-1">
            <span class="badge bg-label-${d.incomeToday.status}">${d.incomeToday.percentage}</span>
          </div>`);

        $('.incomeThisMonth').html(`<p class="mb-2 mt-1">${formatNumber(d.incomeThisMonth.income)}</p>
          <div class="pt-1">
            <span class="badge bg-label-${d.incomeThisMonth.status}">${d.incomeThisMonth.percentage}</span>
          </div>`);

        const earningReportYearlyEl = document.querySelector('#earningReportYearly'),
          earningReportYearlyConfig = EarningReportsBarChart(
            d.reportThisYear.chartData,
            d.reportThisYear.categoryData,
            d.reportThisYear.activeIndex
          );
        if (typeof earningReportYearlyEl !== undefined && earningReportYearlyEl !== null) {
          const earningReportYearly = new ApexCharts(earningReportYearlyEl, earningReportYearlyConfig);
          earningReportYearly.render();
        }

        const earningReportMonthlyEl = document.querySelector('#earningReportMonthly'),
          earningReportMonthlyConfig = EarningReportsBarChart(
            d.reportThisMonth.chartData,
            d.reportThisMonth.categoryData,
            d.reportThisMonth.activeIndex
          );
        if (typeof earningReportMonthlyEl !== undefined && earningReportMonthlyEl !== null) {
          const earningReportMonthly = new ApexCharts(earningReportMonthlyEl, earningReportMonthlyConfig);
          earningReportMonthly.render();
        }
      } else {
        $('.incomeToday').html(`<p class="mb-2 mt-1">-</p>
          <div class="pt-1">
            <span class="badge bg-label-secondary">-</span>
          </div>`);

        $('.incomeThisMonth').html(`<p class="mb-2 mt-1">-</p>
          <div class="pt-1">
            <span class="badge bg-label-secondary">-</span>
          </div>`);

        $('#earningReportYearly').html('<span class="text-muted">Please log in to your Adsense account first.<span>');
        $('#earningReportMonthly').html('<span class="text-muted">Please log in to your Adsense account first.<span>');
      }
    });
  }

  function loadStatistik() {
    $('.loaderStatistik').loaderShow();
    $('.dataStatistik').hide();

    $.get('/api/dashboard?type=statistics', function (d) {
      $('.loaderStatistik').loaderHide();
      $('.dataStatistik').show();

      $('.dataStatistik').html(`<div class="col-md-3 col-6">
        <div class="d-flex align-items-center">
          <div class="badge rounded-pill bg-label-primary me-3 p-2">
            <i class="ti ti-trending-up ti-sm"></i>
          </div>
          <div class="card-info">
            <h5 class="mb-0">${formatNumber(d.totalHits)}</h5>
            <small>Request</small>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="d-flex align-items-center">
          <div class="badge rounded-pill bg-label-info me-3 p-2">
            <i class="ti ti-robot ti-sm"></i>
          </div>
          <div class="card-info">
            <h5 class="mb-0">${d.totalBots}</h5>
            <small>Server Bot</small>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="d-flex align-items-center">
          <div class="badge rounded-pill bg-label-success me-3 p-2">
            <i class="ti ti-key ti-sm"></i>
          </div>
          <div class="card-info">
            <h5 class="mb-0">${d.totalKeys}</h5>
            <small>Access Key</small>
          </div>
        </div>
      </div>
      <div class="col-md-3 col-6">
        <div class="d-flex align-items-center">
          <div class="badge rounded-pill bg-label-danger me-3 p-2">
            <i class="ti ti-alert-octagon ti-sm"></i>
          </div>
          <div class="card-info">
            <h5 class="mb-0">${formatNumber(d.totalErrors)}</h5>
            <small>Error</small>
          </div>
        </div>
      </div>`);
    });
  }

  function loadChartPlatform() {
    $('.loaderPlatformChart').loaderShow();
    $('#earningPlatformChart').hide();

    $.get('/api/dashboard?type=platform', function ({ labels, series }) {
      $('.loaderPlatformChart').loaderHide();
      $('#earningPlatformChart').show();
      $('#earningPlatformChart').html('');

      if (!labels || !series) {
        $('#earningPlatformChart').html('<span class="text-muted">Please log in to your Adsense account first.<span>');
        return;
      }

      const earningPlatformChartE1 = document.querySelector('#earningPlatformChart'),
        total = series.reduce((accumulator, currentValue) => accumulator + currentValue, 0),
        earningPlatformChartConfig = {
          chart: {
            height: 400,
            parentHeightOffset: 0,
            type: 'donut',
          },
          labels,
          series,
          colors: [
            chartColors.donut.series1,
            chartColors.donut.series2,
            chartColors.donut.series3,
            chartColors.donut.series4,
          ],
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
                return formatNumber(val);
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
                    label: labels[0],
                    color: labelColor,
                    formatter: function (w) {
                      return ((series[0] / total) * 100).toFixed(0) + '%';
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

      if (typeof earningPlatformChartE1 !== undefined && earningPlatformChartE1 !== null) {
        const earningPlatformChart = new ApexCharts(earningPlatformChartE1, earningPlatformChartConfig);
        earningPlatformChart.render();
      }
    });
  }

  function loadChartCountry() {
    $('.loaderCountryChart').loaderShow();
    $('#earningCountryChart').hide();

    $.get('/api/dashboard?type=country', function ({ labels, series }) {
      $('.loaderCountryChart').loaderHide();
      $('#earningCountryChart').show();
      $('#earningCountryChart').html('');

      if (!labels || !series) {
        $('#earningCountryChart').html('<span class="text-muted">Please log in to your Adsense account first.<span>');
        return;
      }

      const earningCountryChartE1 = document.querySelector('#earningCountryChart'),
        total = series.reduce((accumulator, currentValue) => accumulator + currentValue, 0),
        earningCountryChartConfig = {
          chart: {
            height: 400,
            parentHeightOffset: 0,
            type: 'donut',
          },
          labels,
          series,
          colors: [
            chartColors.donut.series1,
            chartColors.donut.series2,
            chartColors.donut.series3,
            chartColors.donut.series4,
          ],
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
                return formatNumber(val);
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
                    label: labels[0],
                    color: labelColor,
                    formatter: function (w) {
                      return ((series[0] / total) * 100).toFixed(0) + '%';
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

      if (typeof earningCountryChartE1 !== undefined && earningCountryChartE1 !== null) {
        const earningCountryChart = new ApexCharts(earningCountryChartE1, earningCountryChartConfig);
        earningCountryChart.render();
      }
    });
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
});
