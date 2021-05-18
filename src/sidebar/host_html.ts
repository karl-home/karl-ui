import { Network } from '../network';

export interface Host {
  id: string,
  activeModules: number,
  online: boolean,
}

export module HostModals {
  const headerVals = ['Host ID', 'Active Modules', 'Online']
  let confirmed: Host[];
  let hostTable: HTMLTableElement;
  let unconfirmed: {
    [key: string]: {
      hostId: string;
      html: HTMLDivElement;
    }
  } = {};

  function renderModals(unconfirmedIds: string[]) {
    function clear() {
      Object.values(unconfirmed).forEach(s => s.html.remove())
      unconfirmed = {}
    }

    function confirmHost(hostId: string) {
      if (unconfirmed.hasOwnProperty(hostId)) {
        unconfirmed[hostId].html.remove()
        Network.confirmHost(hostId)
        confirmed.push({
          id: hostId,
          activeModules: 0,
          online: false,
        })
        renderTable()
        delete unconfirmed[hostId]
      } else {
        console.error(`failed to confirm missing host: ${hostId}`)
      }
    }

    function cancelHost(hostId: string) {
      if (unconfirmed.hasOwnProperty(hostId)) {
        unconfirmed[hostId].html.remove()
        Network.cancelHost(hostId)
        delete unconfirmed[hostId]
      } else {
        console.error(`failed to confirm missing host: ${hostId}`)
      }
    }

    function genHostModal(id: string): HTMLDivElement {
      let modal = document.createElement('div')
      let hostId = document.createElement('p')
      hostId.appendChild(document.createTextNode('Host ID: '))
      hostId.appendChild(document.createTextNode(id))

      // generate buttons
      let buttons = document.createElement('div')
      buttons.className = 'button-container'
      let confirmButton = document.createElement('button')
      confirmButton.innerText = 'Confirm'
      confirmButton.onclick = function(e) {
        e.preventDefault()
        confirmHost(id)
      }
      let cancelButton = document.createElement('button')
      cancelButton.innerText = 'Cancel'
      cancelButton.onclick = function(e) {
        e.preventDefault()
        cancelHost(id)
      }
      buttons.appendChild(confirmButton)
      buttons.appendChild(cancelButton)

      // generate modal
      modal.className = 'modal'
      modal.appendChild(hostId)
      modal.appendChild(buttons)
      return modal
    }

    clear()
    let container = document.getElementById('host-modals')
    unconfirmedIds.forEach(function(hostId) {
      let modal = genHostModal(hostId)
      container.appendChild(modal)
      unconfirmed[hostId] = {
        hostId: hostId,
        html: modal,
      }
    })
  }

  function renderTable() {
    function genTable(): HTMLTableElement {
      let table = document.createElement('table')
      let tr = document.createElement('tr')
      headerVals.forEach(function(val) {
        let th = document.createElement('th')
        th.appendChild(document.createTextNode(val))
        tr.appendChild(th)
      })
      table.appendChild(tr)
      return table
    }

    if (hostTable) {
      hostTable.remove()
    }
    hostTable = genTable()
    confirmed.forEach(function(host) {
      let tr = document.createElement('tr')
      let td = document.createElement('td')
      td.appendChild(document.createTextNode(host.id))
      tr.appendChild(td)
      td = document.createElement('td')
      td.appendChild(document.createTextNode(host.activeModules.toString()))
      tr.appendChild(td)
      td = document.createElement('td')
      td.appendChild(document.createTextNode(host.online ? 'yes' : 'no'))
      tr.appendChild(td)
      hostTable.appendChild(tr)
    })
    document.getElementById('host-table').appendChild(hostTable)
  }

  export function renderInitialForm() {
    function refresh() {
      Network.getHosts(function(conf: Host[], unconf: string[]) {
        renderModals(unconf)
        confirmed = conf
        renderTable()
      });
    }
    refresh()
    let buttonContainer = document.createElement('p')
    let button = document.createElement('button')
    button.innerText = 'Refresh'
    button.onclick = function(e) {
      e.preventDefault()
      refresh()
    }
    buttonContainer.appendChild(button)
    document.getElementById('host-form').appendChild(buttonContainer)
  }
}
