import { useState, Fragment } from 'react'
import { Combobox } from '@headlessui/react'

function XIcon ({ className, onClick }) {
  return (
    <svg className={className} onClick={onClick} xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={2}>
      <path strokeLinecap='round' strokeLinejoin='round' d='M6 18L18 6M6 6l12 12' />
    </svg>
  )
}
export default function AutocompleteInput ({ items, selectedItems, setSelectedItems }) {
  const [query, setQuery] = useState('')

  function removeSelectedItem (itemId) {
    const newSelectedItems = selectedItems.filter(item => item.id !== itemId)
    setSelectedItems(newSelectedItems)
  }

  const filteredItems =
    query === ''
      ? items
      : items.filter(({ name }) => name.toLowerCase().includes(query.toLowerCase()))

  return (
    <Combobox value={selectedItems} onChange={setSelectedItems} multiple>
      <Combobox.Input
        onChange={(event) => setQuery(event.target.value)}
        displayValue={(item) => item.name}
        className='block w-full rounded-md border-gray-300'
      />
      {selectedItems.length > 0 && (
        <div className='flex mt-1'>
          {selectedItems.map(({ id, name }) => (
            <div key={id} className='flex p-1 border-solid border-2 border-gray-300 rounded-md mr-2'>
              {name} <XIcon className='w-4 ml-3' onClick={() => removeSelectedItem(id)} />
            </div>
          ))}
        </div>
      )}
      <Combobox.Options className='border-solid border-2 border-gray-300 rounded-md'>
        {filteredItems.map((item) => (
          /* Use the `active` state to conditionally style the active option. */
          <Combobox.Option key={item.id} value={item} as={Fragment}>
            {({ active }) => (
              <li
                className={`px-4 py-2 ${
                  active ? 'bg-kernel-green-dark text-white' : 'bg-white text-black'
                }`}
              >
                {item.name}
              </li>
            )}
          </Combobox.Option>
        ))}
      </Combobox.Options>
    </Combobox>
  )
}
