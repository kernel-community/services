
import { useEffect, useReducer, useState } from 'react'


const INITIAL_STATE = {value: ''}

const actions = {
  update: (state, value) => Object.assign(state, { value })
}

const reducer2 = (state, action) => {
  try {
    console.log(action.type, action.payload, state)
    return actions[action.type](state, action.payload)
  } catch (error) {
    console.log(error)
    throw {name: 'UnknownActionError', message: `Unhandled action: ${action.type}`}
  }
}

const reducer = (state, action) => {
  console.log(action.type, action.payload, state)
  return Object.assign({}, state, { value: action.payload })
  //return Object.assign(state, { value: action.payload })
}

const change = (dispatch, e) => {
  try {
    e.preventDefault()
    const payload = e.target.value
    console.log(payload)
    dispatch({ type: 'update', payload })
  } catch (error) {
    console.log(error)
  }
}

const EditComponent = ({ state, dispatch }) => {
  console.log('render', state)
  //return <textarea rows="15" className="w-full" value={ state.resource } onChange={ change } />
  return <input type="text" className="w-full" value={ state.value } onChange={ change.bind(null, dispatch) } />
}

const Debug = () => {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE) 

  //return (<div><EditComponent state={ state } dispatch={ dispatch } /></div>)
  return (<div><input value={ state.value } onChange={ (e) => dispatch({ type: 'update', payload: e.target.value }) } /></div>)
}

export default Debug
