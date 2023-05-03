import * as React from 'react';
import { ISliderProps } from './ISliderProps';
import { Image, ImageFit, Link } from '@fluentui/react/lib/index';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

export interface ISliderCarouselListItem {
  Titulo: string;
  Descricao: string;
  DirecionamentoURL: { Url: string };
  ArquivoURL: { Url: string };
}


export interface ISliderCarouselDemoState {
  value: ISliderCarouselListItem[];
}

export default class Slider extends React.Component<React.PropsWithChildren<ISliderProps>, ISliderCarouselDemoState> {
  constructor(props: React.PropsWithChildren<ISliderProps>) {
    super(props);
    this.state = {
      value: []
    }
  }

  private getCarouselListContent = () => {
    try {
      let requestUrl = `${this.props.absoluteURL}/_api/web/Lists/GetByTitulo('${this.props.listName}')/Items`;
      this.props.spHttpClient.get(requestUrl, SPHttpClient.configurations.v1)
        .then((response: SPHttpClientResponse): Promise<ISliderCarouselDemoState> => {
          if (response.ok) {
            return response.json();
          }
        }).then((item: ISliderCarouselDemoState) => {      
          if (item!=null){ 
            try{            
              this.setState(({  
                value: item.value             
              }));            
            }
            catch(err){        
            }
          }
        });        
    } catch (error) {
      console.log('error in service ', error);
    }
  }

  componentDidMount = () => {
    this.getCarouselListContent();
  }

  public render(): React.ReactElement<React.PropsWithChildren<ISliderProps>> {
    let collection = this.state.value;
    console.log('Collection ', collection);
    return (
      <div>
        {collection.length > 0 && collection.map((data, index) => {
          return (
            <div key={index}>
              <Link href={data.ArquivoURL['Url']}>
                <Image
                  src={data.DirecionamentoURL['Url']}
                  alt={data.Titulo}
                  imageFit={ImageFit.cover}
                />
              </Link>
              <div>{data.Titulo}</div>
              <div>{data.Descricao}</div>
            </div>
          )
        })}
      </div>
    );
  }
}
