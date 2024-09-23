import React from "react"
import { Content } from "../../../_metronic/layout/components/content";
import { ToolbarWrapper } from "../../../_metronic/layout/components/toolbar";

const cardsMock = [
  { name: 'Org 1', imgUrl: undefined },
  { name: 'Org 2 aushuias hasuhiasu 2234 fh it hah', imgUrl: undefined },
  { name: 'Org 3', imgUrl: undefined },
  { name: 'Org 4', imgUrl: undefined },
  { name: 'Org 5', imgUrl: undefined },
  { name: 'Org 6', imgUrl: undefined },
  { name: 'Org 7', imgUrl: undefined },
  { name: 'Org 8', imgUrl: undefined },
  { name: 'Org 9', imgUrl: undefined },
  { name: 'Org 10', imgUrl: undefined },
  { name: 'Org 11', imgUrl: undefined },
]

const OrganizationSelectPage: React.FC = () => {

  const CardItem = (name: string, imgUrl: string = 'https://d1csarkz8obe9u.cloudfront.net/posterpreviews/company-logo-design-template-e089327a5c476ce5c70c74f7359c5898_screen.jpg') => (
    <div
      key={`org-card-${name}`}
      className="card card-custom card-flush">
      <div className="card-body py-5">
        <img
          src={imgUrl}
          alt={`Organization-logo-${name}`}
        />
      </div>
      <div className="card-footer p-5 text-center">
        {name}
      </div>
    </div>
  )

  return (
    <div className="organization-select bg-gray w-75 border mw-900px rounded align-self-center">
      <ToolbarWrapper />
      <Content>
        <div className="org-container">
          {cardsMock.map(card => CardItem(card.name, card.imgUrl))}
        </div>
      </Content>
    </div>
  )
}

export default OrganizationSelectPage;
