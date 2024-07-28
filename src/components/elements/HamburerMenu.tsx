"use client";
import styles from "./common.module.css";
import classNames from 'classnames';
import { useState } from "react";

// ClassNameの条件:記事作る
// https://chatgpt.com/c/c017f817-f748-43ae-b9f3-653cc4e01703

const HamburgerMenu = () => {
  const [isActive, setIsActive] = useState(false);

  const handleClick = () => {
    setIsActive(!isActive);
  };

  return (
    <div 
        className={classNames(styles.spMenu, { [styles.active]: isActive })} 
        onClick={handleClick}
    ><span></span><span>Menu</span><span></span>
    </div>
  )

}
export default HamburgerMenu;

