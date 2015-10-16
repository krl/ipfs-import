
// website logic / routing etc.

var addfile = document.getElementById('addfile')

addfile.addEventListener('file-added', function (e) {
  document.getElementById('display').setAttribute('src', '/ipfs/' + e.detail)
}, false)
