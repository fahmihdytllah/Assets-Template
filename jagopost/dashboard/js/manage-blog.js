$(document).ready(function () {
  let colors = ['primary', 'success', 'info', 'secondary', 'warning'];

  loadBlogs();

  function getAvatarInitials(name) {
    if (!name) return '';

    const words = name.trim().split(' ');

    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }

    const firstInitial = words[0].charAt(0).toUpperCase();
    const lastInitial = words[words.length - 1].charAt(0).toUpperCase();

    return firstInitial + lastInitial;
  }

  function loadBlogs() {
    $('#listBlogs').html('');
    $('.card-table').block({
      message: elementLoader,
      css: { backgroundColor: 'transparent', border: '0' },
      overlayCSS: { backgroundColor: '#fff', opacity: 0.8 },
    });

    $.get('?type=json', function (response) {
      $('.card-table').unblock();

      response.data.forEach((blog) => {
        $('#listBlogs').append(`<tr>
          <td>
            <div class="d-flex justify-content-left align-items-center">
              <div class="avatar me-2">
                <span class="avatar-initial rounded-circle bg-label-${
                  colors[Math.floor(Math.random() * colors.length)]
                }">${getAvatarInitials(blog.title)}</span>
              </div>
              <div class="d-flex flex-column">
                <span class="fw-medium"><a href="${blog.url}">${blog.title}</a></span>
                <small class="text-muted">${blog.totalPosts} Posts & ${blog.totalPages} Pages</small>
              </div>
            </div>
          </td>
          <td><span class="badge rounded-pill bg-label-info me-1">${blog.status}</span></td>
          <td>${blog?.published ? moment(blog.published).format('LLL') : '-'}</td>
          <td>
            <a href="${blog.id === 'wp' ? '/u/w/posts' : '/u/b/posts/' + blog.id}" class="btn p-0 bot-delete">
              <i class="ti ti-list-details"></i>
            </a>
          </td>
        </tr>`);
      });
    });
  }
});
