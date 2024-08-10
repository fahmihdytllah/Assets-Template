$(function () {
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
  loadStatistic();

  /** Load Campaign average */
  loadCampaignAverage();

  $('.refreshCampaignAverage').click(function () {
    loadCampaignAverage();
  });

  /** Load Campaign Report */
  loadCampaignReport();

  $('.refreshCampaignReport').click(function () {
    loadCampaignReport();
  });

  /** Load Post */
  loadPost();

  $('.refreshLastPost').click(function () {
    loadPost();
  });

  /** Load activity timeline */
  loadActivity();

  $('.refreshActivityTimeline').click(function () {
    loadActivity();
  });

  /** Handler Function */
  function loadStatistic() {
    $('.loader').show();
    $.get('/api/userDashboard?type=statistic', function (res) {
      $('.loader').hide();
      $('.dataStatistic').show();
      $('.dataStatistic').html(`
        <div class="col-md-3 col-6">
          <div class="d-flex align-items-center">
            <div class="badge rounded-pill bg-label-primary me-3 p-2">
              <i class="ti ti-brand-blogger ti-sm"></i>
            </div>
            <div class="card-info">
              <h5 class="mb-0">${res.totalBlogs}</h5>
              <small>Blogs</small>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="d-flex align-items-center">
            <div class="badge rounded-pill bg-label-secondary me-3 p-2">
              <i class="ti ti-news ti-sm"></i>
            </div>
            <div class="card-info">
              <h5 class="mb-0">${res.totalPosts}</h5>
              <small>Posts</small>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="d-flex align-items-center">
            <div class="badge rounded-pill bg-label-info me-3 p-2">
              <i class="ti ti-api-app ti-sm"></i>
            </div>
            <div class="card-info">
              <h5 class="mb-0">${res.totalCampaign}</h5>
              <small>Campaign</small>
            </div>
          </div>
        </div>
        <div class="col-md-3 col-6">
          <div class="d-flex align-items-center">
            <div class="badge rounded-pill bg-label-success me-3 p-2">
              <i class="ti ti-license ti-sm"></i>
            </div>
            <div class="card-info">
              <h5 class="mb-0">${res.totalPostCampaign}</h5>
              <small>Post Campaign</small>
            </div>
          </div>
        </div>`);
    });
  }

  function loadActivity() {
    const colors = {
      login: 'secondary',
      register: 'info',
      updateAccount: 'warning',
      changePassword: 'danger',
      upgradePlan: 'success',
      createCampaign: 'primary',
    };

    $('.loaderActivity').show();
    $('.listActivitys').hide();

    $.get('/api/userDashboard?type=activity', function (res) {
      $('.loaderActivity').hide();
      $('.listActivitys').show();
      $('.listActivitys').html('');

      res.data.forEach((activity, index) => {
        $('.listActivitys').append(`
          <li class="timeline-item timeline-item-transparent ps-4 ${
            index === res.data.length - 1 ? 'border-transparent' : ''
          }">
            <span class="timeline-point timeline-point-${colors[activity.type]}"></span>
            <div class="timeline-event">
              <div class="timeline-header">
                <h6 class="mb-0">${activity.title}</h6>
                <small class="text-muted">${activity.updatedAt}</small>
              </div>
              <p class="mb-0">${activity.description}</p>
            </div>
          </li>`);
      });
    });
  }

  function loadPost() {
    $('.loaderPost').show();
    $('.listPosts').hide();

    $.get('/api/userDashboard?type=post', function (res) {
      $('.loaderPost').hide();
      $('.listPosts').show();
      $('.listPosts').html('');

      if (!res.data?.length) {
        $('.listPosts').append(`
          <tr>
            <td><span class="text-center text-muted">You don't have a post yet...</span></td>
          </tr>
        `);
      }

      res.data.forEach((post) => {
        $('.listPosts').append(`
          <tr>
            <td>
              <div class="d-flex justify-content-start align-items-center">
                <div class="me-3">
                  <img src="${post.thumbnail}" alt="${post.title}" class="rounded" height="40" />
                </div>
                <p class="mb-0 fw-medium">${post.title}</p>
              </div>
            </td>
            <td>${post.updatedAt}</td>
            <td>
              <a target="_blank" href="${post.url}" data-bs-toggle="tooltip" aria-label="Preview" data-bs-original-title="Preview"><i class="ti ti-eye mx-2 ti-sm"></i></a>
            </td>
          </tr>`);
      });
    });
  }

  function loadCampaignAverage() {
    $('.loaderCampaignAverage').show();
    $('#campaignAverageChart').hide();

    $.get('/api/userDashboard?type=campaignAverage', function (res) {
      $('.loaderCampaignAverage').hide();
      $('#campaignAverageChart').show();
      $('#campaignAverageChart').html('');

      const campaignAverageChartE1 = document.querySelector('#campaignAverageChart'),
        total = res.chartData.reduce((accumulator, currentValue) => accumulator + currentValue, 0),
        campaignAverageChartConfig = {
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
            theme: false,
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

      if (!res.categoryData.length && !res.chartData?.length) {
        $('#campaignAverageChart').html(`<span class="text-center text-muted">You don't have a post yet...</span>`);
      } else {
        if (typeof campaignAverageChartE1 !== undefined && campaignAverageChartE1 !== null) {
          const campaignAverageChart = new ApexCharts(campaignAverageChartE1, campaignAverageChartConfig);
          campaignAverageChart.render();
        }
      }
    });
  }

  // Campaign Reports
  function CampaignReportsBarChart(chartData, categoryData, highlightData) {
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

    const campaignReportBarChartOpt = {
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
            // return parseInt(val / 1) + 'k';
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
    return campaignReportBarChartOpt;
  }

  function loadCampaignReport() {
    $('.loaderCampaignReport').show();
    $('#campaignReportChart').hide();

    $.get('/api/userDashboard?type=campaignReport', function (res) {
      $('.loaderCampaignReport').hide();
      $('#campaignReportChart').show();
      $('#campaignReportChart').html('');

      const campaignReportChartEl = document.querySelector('#campaignReportChart'),
        campaignReportChartConfig = CampaignReportsBarChart(res.chartData, res.categoryData, res.largesIndex);

      if (!res.largesIndex) {
        $('#campaignReportChart').html(`<span class="text-center text-muted">You don't have a post yet...</span>`);
      } else {
        if (typeof campaignReportChartEl !== undefined && campaignReportChartEl !== null) {
          const campaignReportChart = new ApexCharts(campaignReportChartEl, campaignReportChartConfig);
          campaignReportChart.render();
        }
      }
    });
  }
});
