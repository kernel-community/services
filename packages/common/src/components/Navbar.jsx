/**
 * Copyright (c) Kernel
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import React from "react"
import { NavbarLink } from "@kernel/common"
import { Link } from "react-router-dom"

const defaults = {
  homeUrl: `/`,
  backgroundColor: "bg-white",
  textColor: "text-gray-800",
}

export default function Navbar(props) {
  const [ navbarOpen, setNavbarOpen ] = React.useState(false);
  const { title, menuLinks, additionalMenuItems } = props;
  const homeUrl = props.homeUrl || defaults.homeUrl;
  const backgroundColor = props.backgroundColor || defaults.backgroundColor;
  const textColor = props.textColor || defaults.textColor;

  return (
    <nav className={`relative ${backgroundColor} flex flex-wrap items-center justify-between px-2 py-4`} >
      <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
        <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
          <button
            className={`${textColor} text-sm font-bold leading-relaxed inline-block mr-4 py-2
              whitespace-nowrap uppercase`}
          >
            { title && <Link to={ homeUrl }>{ title }</Link> }
          </button>
          { menuLinks &&
            <button
              className={`cursor-pointer text-xl leading-none px-3 py-1 border border-solid
              border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none`}
              type="button"
              onClick={() => setNavbarOpen(!navbarOpen)}
            >
              <i className={`${textColor} fas fa-bars`} ></i>
            </button>
          }
        </div>
        { menuLinks &&
          <div
            className={
              `lg:flex flex-grow items-center ${backgroundColor} lg:bg-transparent
              ${navbarOpen ? " block rounded" : " hidden"}`
            }
            id="example-navbar-warning"
          >
            <ul className="flex flex-col lg:flex-row list-none ml-3 mt-3">
              { menuLinks?.map(menuLink => {
                  return (
                    <li key={ menuLink.url } className="flex items-center">
                      <NavbarLink link={ menuLink } textColor={ textColor } />
                    </li>
                  );
              })}

              { additionalMenuItems?.map((additionalMenuItem, idx) => {
                return (
                  <li key={ idx } className="flex items-center">
                    { additionalMenuItem }
                  </li>
                );
              })}
            </ul>
          </div>
        }
      </div>
    </nav>
  );
}
