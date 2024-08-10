$.fn.extend({
  loaderHide: function () {
    this.removeClass('d-flex').addClass('d-none');
  },
  loaderShow: function () {
    this.removeClass('d-none').addClass('d-flex');
  },
});

$(document).ready(function () {
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

  // load data analystic
  loadStatistik();
  loadEarningReportYearly();

  $('.btn-refresh').click(function () {
    loadEarningReportYearly();
    loadStatistik();
  });

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
          earningReportYearlyConfig = EarningReportsBarChart(d.reportThisYear.chartData, d.reportThisYear.categoryData, d.reportThisYear.activeIndex);
        if (typeof earningReportYearlyEl !== undefined && earningReportYearlyEl !== null) {
          const earningReportYearly = new ApexCharts(earningReportYearlyEl, earningReportYearlyConfig);
          earningReportYearly.render();
        }

        const earningReportMonthlyEl = document.querySelector('#earningReportMonthly'),
          earningReportMonthlyConfig = EarningReportsBarChart(d.reportThisMonth.chartData, d.reportThisMonth.categoryData, d.reportThisMonth.activeIndex);
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
