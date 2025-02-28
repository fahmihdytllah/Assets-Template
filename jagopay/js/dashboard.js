/**
 * Dashboard Admin
 */

'use strict';

(function () {
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
      series1: '#FF8C24',
      series2: '#b36f19',
      series3: '#ffe7c8',
      series4: '#ffcf92',
    },
    bar: {
      series1: config.colors.primary,
      series2: '#7367F0CC',
      series3: '#7367f099',
    },
  };

  /** Load data statistic */
  // loadStatistic();

  /** Load Campaign average */
  loadOrderAverage();

  $('.refreshOrderAverage').click(function () {
    loadOrderAverage();
  });

  /** Load Campaign Report */
  loadOrderReport();

  $('.refreshOrderReport').click(function () {
    loadOrderReport();
  });

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

  function loadStatistic() {
    $.get('/api/dashboard?type=statistic', function (res) {
      $('.totalUsers').html(res.totalUsers);
      $('.totalCampaigns').html(res.totalCampaigns);
      $('.totalPosts').html(res.totalPosts);
      $('.totalTransactions').html(res.totalTransactions);
    });
  }

  function loadOrderAverage() {
    $('.loaderOrderAverage').show();
    $('#orderAverageChart').hide();

    $.get('/api/dashboard?type=orderAverage', function (res) {
      $('.loaderOrderAverage').hide();
      $('#orderAverageChart').show();
      $('#orderAverageChart').html('');

      const orderAverageChartE1 = document.querySelector('#orderAverageChart'),
        total = res.chartData.reduce((accumulator, currentValue) => accumulator + currentValue, 0),
        orderAverageChartConfig = {
          chart: {
            height: 400,
            parentHeightOffset: 0,
            type: 'donut',
          },
          labels: res.categoryData,
          series: res.chartData,
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
              return parseInt(val) + '%';
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
                      return ((val / total) * 100).toFixed(1) + '%';
                    },
                  },
                  name: {
                    offsetY: 20,
                    fontFamily: 'Public Sans',
                  },
                  total: {
                    show: true,
                    fontSize: '0.9rem',
                    label: res.categoryData[0],
                    color: labelColor,
                    formatter: function (w) {
                      return ((res.chartData[0] / total) * 100).toFixed(1) + '%';
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
                  height: 350,
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
      if (typeof orderAverageChartE1 !== undefined && orderAverageChartE1 !== null) {
        const orderAverageChart = new ApexCharts(orderAverageChartE1, orderAverageChartConfig);
        orderAverageChart.render();
      }
    });
  }

  // Campaign Reports
  function OrderReportsBarChart(chartData, categoryData, highlightData) {
    const basicColor = '#ffcf92',
      highlightColor = '#FF8C24';
    var colorArr = [];

    for (let i = 0; i < chartData.length; i++) {
      if (i === highlightData) {
        colorArr.push(highlightColor);
      } else {
        colorArr.push(basicColor);
      }
    }

    const orderReportBarChartOpt = {
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
          borderRadius: 4,
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
          return val; /** chart data */
        },
        offsetY: -20,
        style: {
          fontSize: '15px',
          colors: [legendColor],
          fontWeight: '500',
          fontFamily: 'Public Sans',
        },
      },
      series: [
        {
          data: chartData,
        },
      ],
      legend: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
      xaxis: {
        categories: categoryData,
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
            return formatNumber(val);
            return val; /** chart data vertical */
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
    return orderReportBarChartOpt;
  }

  function loadOrderReport() {
    $('.loaderOrderReport').show();
    $('#orderReportChart').hide();

    $.get('/api/dashboard?type=orderReport', function (res) {
      $('.loaderOrderReport').hide();
      $('#orderReportChart').show();
      $('#orderReportChart').html('');

      const orderReportChartEl = document.querySelector('#orderReportChart'),
        orderReportChartConfig = OrderReportsBarChart(res.chartData, res.categoryData, res.largesIndex);

      if (typeof orderReportChartEl !== undefined && orderReportChartEl !== null) {
        const orderReportChart = new ApexCharts(orderReportChartEl, orderReportChartConfig);
        orderReportChart.render();
      }
    });
  }
})();
