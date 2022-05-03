/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

const formClass = 'mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'

const Form = ({ text = 'Create', value, create, change, state, dispatch }) => (
  <form className='grid grid-cols-1 gap-6'>
    <label className='block'>
      <span className='text-gray-700'>Your Name</span>
      <input
        type='text' className={`${formClass} disabled:opacity-50`}
        value={value(state, 'nickname')} disabled
      />
    </label>
    <label className='block'>
      <span className='text-gray-700'>Title</span>
      <input
        type='text' className={formClass}
        value={value(state, 'title')} onChange={change.bind(null, dispatch, 'title')}
      />
    </label>
    <label className='block'>
      <span className='text-gray-700'>Location</span>
      <input
        type='text' className={formClass}
        value={value(state, 'location')} onChange={change.bind(null, dispatch, 'location')}
      />
    </label>
    <label className='block'>
      <span className='text-gray-700'>Seat Limit</span>
      <input
        type='text' className={formClass}
        value={value(state, 'limit')} onChange={change.bind(null, dispatch, 'limit')}
      />
    </label>
    <label className='block'>
      <span className='text-gray-700'>Start Time</span>
      <input
        type='text' className={formClass}
        value={value(state, 'start')} onChange={change.bind(null, dispatch, 'start')}
      />
    </label>
    <label className='block'>
      <span className='text-gray-700'>End Time</span>
      <input
        type='text' className={formClass}
        value={value(state, 'end')} onChange={change.bind(null, dispatch, 'end')}
      />
    </label>
    <label className='block'>
      <span className='text-gray-700'>Description</span>
      <textarea
        rows='10' className={formClass}
        value={value(state, 'description')} onChange={change.bind(null, dispatch, 'description')}
      />
    </label>
    <label className='block'>
      <button
        onClick={create.bind(null, state, dispatch)}
        className='w-full py-2 px-3 bg-indigo-500 text-white text-sm font-semibold rounded-md shadow focus:outline-none'
      >
        {text}
      </button>
    </label>
    {state && state.error &&
      <label className='block'>
        <span className='text-gray-700'>Error</span>
        <div className={formClass}>
          {state.error.message}
        </div>
      </label>}
  </form>
)

export default Form
