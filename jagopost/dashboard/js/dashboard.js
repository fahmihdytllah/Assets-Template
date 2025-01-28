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
            <div class="badge rounded-pill bg-label-dark me-3 p-2">
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

  function loadPost() {
    $('.loaderPost').show();
    $('.listPosts').hide();

    $.get('/api/userDashboard?type=post', function (res) {
      $('.loaderPost').hide();
      $('.listPosts').show();
      $('.listPosts').html('');
      $('.total-post-this-month').html(res.data.totalPostThisMonth);

      if (!res.data.items.length) {
        $('.listPosts').append(`
          <tr>
            <td><span class="text-center text-muted">You don't have a post yet...</span></td>
          </tr>
        `);
      }

      res.data.items.forEach((post) => {
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
            <td>${post.campaignId.name}</td>
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
            height: 350,
            parentHeightOffset: 0,
            type: 'donut',
          },
          labels: res.categoryData,
          series: res.chartData,
          colors: ['#ff733b', '#ff8e5d', '#ffa87f', '#ffc1a2', '#ffd9c7'],
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

      if (!res.status) {
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
  function CampaignReportsBarChart(chartData, categoryData, largesIndex) {
    const campaignReportBarChartOpt = {
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
            dataPointIndex: largesIndex,
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
          name: 'Total Post',
          data: chartData,
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
      grid: {
        show: true,
        borderColor: borderColor,
        padding: {
          // top: -15,
          // bottom: -10,
          // left: 15,
          // right: 10,
          top: 0,
          bottom: 0,
          left: 10,
          right: 0,
        },
      },
      xaxis: {
        categories: categoryData,
        labels: {
          offsetX: 0,
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
            return val;
          },
          style: {
            fontSize: '13px',
            colors: labelColor,
            fontFamily: 'Public Sans',
          },
        },
        min: 0,
        tickAmount: 4,
      },
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

      if (!res.status) {
        $('#campaignReportChart').html(`<span class="text-center text-muted">You don't have a post yet...</span>`);
      } else {
        if (typeof campaignReportChartEl !== undefined && campaignReportChartEl !== null) {
          const campaignReportChart = new ApexCharts(campaignReportChartEl, campaignReportChartConfig);
          campaignReportChart.render();
        }
      }
    });
  }

  // Radial bar chart functions
  function radialBarChart(color, value, show) {
    const radialBarChartOpt = {
      chart: {
        height: show == 'true' ? 58 : 48,
        width: show == 'true' ? 58 : 38,
        type: 'radialBar',
      },
      plotOptions: {
        radialBar: {
          hollow: {
            size: show == 'true' ? '50%' : '25%',
          },
          dataLabels: {
            show: show == 'true' ? true : false,
            value: {
              offsetY: -10,
              fontSize: '15px',
              fontWeight: 500,
              fontFamily: 'Public Sans',
              color: headingColor,
            },
          },
          track: {
            background: config.colors_label.secondary,
          },
        },
      },
      stroke: {
        lineCap: 'round',
      },
      colors: [color],
      grid: {
        padding: {
          top: show == 'true' ? -12 : -15,
          bottom: show == 'true' ? -17 : -15,
          left: show == 'true' ? -17 : -5,
          right: -15,
        },
      },
      series: [value],
      labels: show == 'true' ? [''] : ['Progress'],
    };
    return radialBarChartOpt;
  }

  const chartProgressList = document.querySelectorAll('.chart-progress');
  if (chartProgressList) {
    chartProgressList.forEach(function (chartProgressEl) {
      const color = config.colors[chartProgressEl.dataset.color],
        series = chartProgressEl.dataset.series;
      const progress_variant = chartProgressEl.dataset.progress_variant;
      const optionsBundle = radialBarChart(color, series, progress_variant);
      const chart = new ApexCharts(chartProgressEl, optionsBundle);
      chart.render();
    });
  }
});
