IpfsImport(function (ipfsApi, dragDrop) {
  var ipfs = ipfsApi()

  var Component = function (element) {
    return {
      el: element,
      init: function () {
        var self = this
        self.el.innerHTML = '<div id="droparea">' +
          '<input type="file" style="display:none;" id="file"></input>' +
          'Drag and drop a file, or click to select</div>'

        var drop = document.getElementById('droparea')
        var file = document.getElementById('file')

        dragDrop(drop, function (files, pos) {
          console.log('hello')
        })

        drop.onclick = function () {
          file.click()
        }

        file.onchange = function () {
          self.handleFile(file.files[0])
        }
      },
      handleFile: function (file) {
        var self = this

        function add (data) {
          ipfs.add(data, function (err, res) {
            if (err) throw err
            self.el.dispatchEvent(new CustomEvent('file-added',
                                                  { detail: res[0].Hash }))
          })
        }

        var reader = new window.FileReader()
        reader.onload = function () {
          var data = reader.result.substr(reader.result.indexOf(',') + 1)
          data = new ipfs.Buffer(data, 'base64')
          add(data)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  document.registerElement('ipfs-add-file', {
    prototype: Object.create(HTMLElement.prototype, {
      createdCallback: {
        value: function() {
          new Component(this).init()
        }
      }
    })
  })
})
