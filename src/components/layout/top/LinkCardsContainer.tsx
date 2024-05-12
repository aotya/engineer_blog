import React from "react";
import LinkCard from "../../elements/LinkCard";
import styles from "./top.module.css";



export default function LinkCardsContainer() {

  return (
    <>
      <section className="">
        <div className={`${styles.linkCardsContainer} pcWidth`}>
          <LinkCard url="/test/"/>
        </div>
      </section>
    </>
  )  
}