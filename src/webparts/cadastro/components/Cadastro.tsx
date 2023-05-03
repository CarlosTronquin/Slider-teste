import * as React from 'react';
import { ISliderCarouselListItem } from './Slider';
import { sp } from "@pnp/sp";
import { Web } from "@pnp/sp/webs";

const web = Web("siteUrl");

web.setup({
  sp: {
    headers: {
      Accept: "application/json;odata=verbose",
    },
  },
});

export interface ICadastroProps {
  absoluteURL: string;
  listName: string;
}

export interface ICadastroState {
  items: ISliderCarouselListItem[];
  titulo: string;
  descricao: string;
  direcionamentoURL: string;
  arquivoURL: string;
  status: string;
  editingItemId: number | null;
}

export default class Cadastro extends React.Component<ICadastroProps, ICadastroState> {
  constructor(props: ICadastroProps) {
    super(props);
    this.state = {
      items: [],
      titulo: "",
      descricao: "",
      direcionamentoURL: "",
      arquivoURL: "",
      status: "",
      editingItemId: null,
    };
  }

  private getListItems = async (): Promise<ISliderCarouselListItem[]> => {
    const response = await sp.web.lists.getByTitulo(this.props.listName).items
      .select("Titulo", "Descricao", "DirecionamentoURL", "ArquivoURL", "Ordem", "ID")
      .orderBy("Ordem")
      .get();
    return response;
  }

  private createListItem = async () => {
    const { titulo, descricao, direcionamentoURL, arquivoURL } = this.state;
    const body = {
      Titulo: titulo,
      Descricao: descricao,
      DirecionamentoURL: { Url: direcionamentoURL },
      ArquivoURL: { Url: arquivoURL },
      Ordem: this.state.items.length + 1
    };
    try {
      const result = await sp.web.lists.getByTitulo(this.props.listName).items.add(body);
      console.log(`Item criado: ${result.data.ID}`);
      this.setState({
        status: `Item criado: ${result.data.ID}`,
        titulo: "",
        descricao: "",
        direcionamentoURL: "",
        arquivoURL: ""
      });
      await this.getListItems();
    } catch (error) {
      console.log("Erro ao criar o item: ", error);
      this.setState({ status: "Erro ao criar o item." });
    }
  }

  private updateListItem = async () => {
    const { titulo, descricao, direcionamentoURL, arquivoURL, editingItemId } = this.state;
    const body = {
      Titulo: titulo,
      Descricao: descricao,
      direcionamentoURL: { Url: direcionamentoURL },
      ArquivoURL: { Url: arquivoURL },
    };
    try {
      await sp.web.lists.getByTitulo(this.props.listName).items.getById(editingItemId!).update(body);
      console.log(`Item renomeado: ${editingItemId}`);
      this.setState({
        status: `Item renomeado: ${editingItemId}`,
        titulo: "",
        descricao: "",
        direcionamentoURL: "",
        arquivoURL: "",
        editingItemId: null,
      });
      await this.getListItems();
    } catch (error) {
      console.log(`Erro ao renomear o item: ${editingItemId}`, error);
      this.setState({ status: `Erro ao renomear o item: ${editingItemId}` });
    }
  }

  private deleteListItem = async (itemId: number) => {
    try {
      await sp.web.lists.getByTitulo(this.props.listName).items.getById(itemId).delete();
      console.log(`Item deletado: ${itemId}`);
      this.setState({ status: `Item deletado: ${itemId}` });
      await this.getListItems();
    } catch (error) {
      console.log("Erro ao deletar o item: ", error);
      this.setState({ status: "Erro ao deletar o item." });
    }
  }

  public render(): React.ReactElement<React.PropsWithChildren<ICadastroProps>> {
    const { items, titulo, descricao, direcionamentoURL, arquivoURL, status, editingItemId } = this.state;
  
    // Verifica se há um item selecionado para edição
    const isEditing = editingItemId !== null;
  
    return (
      <div>
        {/* Formulário para adicionar ou editar um item */}
        <div>
          <h2>{isEditing ? 'Editar item' : 'Adicionar item'}</h2>
          <form onSubmit={isEditing ? this.updateListItem : this.createListItem}>
            <div>
              <label htmlFor="titulo">Título</label>
              <input type="text" id="titulo" value={titulo} onChange={(e) => this.setState({ titulo: e.target.value })} />
            </div>
            <div>
              <label htmlFor="descricao">Descrição</label>
              <textarea id="descricao" value={descricao} onChange={(e) => this.setState({ descricao: e.target.value })} />
            </div>
            <div>
              <label htmlFor="direcionamentoURL">URL de direcionamento</label>
              <input type="text" id="direcionamentoURL" value={direcionamentoURL} onChange={(e) => this.setState({ direcionamentoURL: e.target.value })} />
            </div>
            <div>
              <label htmlFor="arquivoURL">URL do arquivo</label>
              <input type="text" id="arquivoURL" value={arquivoURL} onChange={(e) => this.setState({ arquivoURL: e.target.value })} />
            </div>
            <div>
              <button type="submit">{isEditing ? 'Salvar' : 'Adicionar'}</button>
              {isEditing && <button type="button" onClick={() => this.setState({ editingItemId: null, titulo: '', descricao: '', direcionamentoURL: '', arquivoURL: '' })}>Cancelar</button>}
            </div>
          </form>
        </div>
  
        {/* Lista de itens */}
        {items.length > 0 && items.map((item: ISliderCarouselListItem, index: number) => (
          <div key={index}>
            <a href={item.DirecionamentoURL.Url} target="_blank" rel="noopener noreferrer">
              <img src={item.ArquivoURL.Url} alt={item.Titulo} />
            </a>
            <div>{item.Titulo}</div>
            <div>{item.Descricao}</div>
            <div>
              <button onClick={() => this.setState({ editingItemId: item.ID, titulo: item.Titulo, descricao: item.Descricao, direcionamentoURL: item.DirecionamentoURL.Url, arquivoURL: item.ArquivoURL.Url })}>Editar</button>
              <button onClick={() => this.deleteListItem(item.ID)}>Excluir</button>
            </div>
          </div>
        ))}
  
        {/* Mensagem de status */}
        <div>{status}</div>
      </div>
    );
  }  
}  
