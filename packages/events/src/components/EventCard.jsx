import { Link } from 'react-router-dom'
const EventCard = (props) => (
    <div class="xl:w-1/4 md:w-1/2 p-4">
      <Link to={`/view/${props.event.id}`}>
        <div class="bg-gray-100 p-6 rounded-lg">
          <h3 class="tracking-widest text-indigo-500 text-xs font-medium title-font">{props.event.nickname} hosting</h3>
          <h2 class="text-lg text-gray-900 font-medium title-font mb-4">{props.event.title}</h2>
          <p class="leading-relaxed text-base">{props.event.description}</p>
        </div>
      </Link>
    </div>
)

export default EventCard