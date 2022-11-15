import { Link } from 'react-router-dom'
const EventCard = (props) => {
  const date = new Date(props.event.start)
  const month = date.getMonth() || ''
  const year = date.getFullYear() || ''

  return (
    <Link to={`/view/${props.event.id}`}>
      <div class='flex p-4 border border-slate-200 rounded-lg m-6'>
        <div class='flex-initial divide-y pr-8'>
          <div class='text-gray-900 title-font font-medium'>{month}</div>
          <div class='text-gray-500'>{year}</div>
        </div>
        <div class='grow'>
          <h2 class='text-2xl text-gray-900 title-font'>{props.event.title}</h2>
          <h3 class='text-xs title-font text-gray-500'>hosted by <span class='font-medium text-indigo-300'>{props.event.nickname}</span></h3>
        </div>
      </div>
    </Link>
  )
}

export default EventCard
