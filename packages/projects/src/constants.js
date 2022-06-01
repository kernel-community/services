import { CodePen, Gist, Figma } from 'mdx-embed'
import { Link } from 'react-router-dom'

/* eslint-disable */
const components = {
  table: (props) => <table {...props} className="border-collapse table-auto w-full text-sm" />,
  th: (props) => <th {...props} className="border-b dark:border-slate-600 font-medium p-4 pl-8 pt-0 pb-3 text-slate-400 dark:text-slate-200 text-left" />,
  td: (props) => <td {...props} className="border-b border-slate-100 dark:border-slate-700 p-4 pl-8 text-slate-500 dark:text-slate-400" />,
  h1: (props) => <h1 {...props} className="text-4xl my-4" />,
  h2: (props) => <h2 {...props} className="text-2xl my-2" />,
  h3: (props) => <h3 {...props} className="text-xl my-1" />,
  ul: (props) => <ul {...props} className="list-disc list-outside ml-4 mb-4" />,
  ol: (props) => <ol {...props} className="list-decimal list-outside ml-4 mb-4" />,
  li: (props) => <li {...props} className="my-2" />,
  p: (props) => <p {...props} className="my-4" />,
  hr: (props) => <hr {...props} className="my-4" />,
  Link: (props) => <Link {...props} to={props.to}>{props.children}</Link>,
  CodePen, Gist, Figma
}
/* eslint-enable */

export { components }
