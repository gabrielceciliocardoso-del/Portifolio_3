import { Component } from '@angular/core';
import { addIcons } from 'ionicons';
import {
  addCircleOutline,
  barChartOutline,
  cashOutline,
  cubeOutline,
  exitOutline,
  homeOutline,
  peopleOutline,
  personAddOutline,
  refreshOutline,
  saveOutline,
  trashOutline,
} from 'ionicons/icons';

type ViewName = 'dashboard' | 'users' | 'products' | 'clients' | 'sales' | 'cashier' | 'reports';

interface User {
  id: string;
  name: string;
  username: string;
  password: string;
  role: string;
  active: boolean;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  minStock: number;
}

interface Client {
  id: string;
  name: string;
  document: string;
  phone: string;
  email: string;
}

interface SaleItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface Sale {
  id: string;
  clientId: string;
  items: SaleItem[];
  paymentMethod: string;
  createdAt: string;
  status?: 'Ativa' | 'Cancelada';
  cancellationReason?: string;
  canceledAt?: string;
  canceledBy?: string;
}

interface Payment {
  id: string;
  saleId: string | null;
  amount: number;
  method: string;
  description: string;
  createdAt: string;
}

interface StoreData {
  users: User[];
  products: Product[];
  clients: Client[];
  sales: Sale[];
  payments: Payment[];
}

interface SaleDraftItem {
  productId: string;
  quantity: number;
}

interface Metrics {
  monthSales: number;
  monthSold: number;
  totalSold: number;
  canceledSales: number;
  stockQuantity: number;
  clients: number;
  products: number;
  cashBalance: number;
}

const STORAGE_KEY = 'controleEstoqueIonic.v1';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false,
})
export class HomePage {
  readonly views: Array<{ key: ViewName; label: string; icon: string }> = [
    { key: 'dashboard', label: 'Painel', icon: 'home-outline' },
    { key: 'users', label: 'Usuarios', icon: 'person-add-outline' },
    { key: 'products', label: 'Produtos', icon: 'cube-outline' },
    { key: 'clients', label: 'Clientes', icon: 'people-outline' },
    { key: 'sales', label: 'Vendas', icon: 'add-circle-outline' },
    { key: 'cashier', label: 'Caixa', icon: 'cash-outline' },
    { key: 'reports', label: 'Relatorios', icon: 'bar-chart-outline' },
  ];

  readonly paymentMethods = ['Dinheiro', 'Pix', 'Cartao de debito', 'Cartao de credito', 'Boleto'];
  readonly roles = ['Administrador', 'Operador', 'Caixa'];

  activeView: ViewName = 'dashboard';
  currentUser: User | null = null;
  loginError = '';
  loginForm = { username: '', password: '' };
  productSearch = '';

  editingUserId: string | null = null;
  editingProductId: string | null = null;
  editingClientId: string | null = null;

  userForm = this.emptyUserForm();
  productForm = this.emptyProductForm();
  clientForm = this.emptyClientForm();
  saleForm = {
    clientId: '',
    paymentMethod: 'Dinheiro',
    items: [{ productId: '', quantity: 1 }] as SaleDraftItem[],
  };
  paymentForm = {
    description: '',
    amount: 0,
    method: 'Dinheiro',
  };

  data: StoreData = this.loadData();

  constructor() {
    addIcons({
      addCircleOutline,
      barChartOutline,
      cashOutline,
      cubeOutline,
      exitOutline,
      homeOutline,
      peopleOutline,
      personAddOutline,
      refreshOutline,
      saveOutline,
      trashOutline,
    });
  }

  get title(): string {
    return this.views.find((view) => view.key === this.activeView)?.label ?? 'Painel';
  }

  get metrics(): Metrics {
    const monthSales = this.currentMonthSales();
    const activeSales = this.activeSales();
    return {
      monthSales: monthSales.length,
      monthSold: monthSales.reduce((sum, sale) => sum + this.saleTotal(sale), 0),
      totalSold: activeSales.reduce((sum, sale) => sum + this.saleTotal(sale), 0),
      canceledSales: this.data.sales.filter((sale) => this.isSaleCanceled(sale)).length,
      stockQuantity: this.data.products.reduce((sum, product) => sum + product.stock, 0),
      clients: this.data.clients.length,
      products: this.data.products.length,
      cashBalance: this.data.payments.reduce((sum, payment) => sum + payment.amount, 0),
    };
  }

  get filteredProducts(): Product[] {
    const term = this.productSearch.toLowerCase().trim();
    if (!term) return this.data.products;
    return this.data.products.filter(
      (product) => product.name.toLowerCase().includes(term) || product.sku.toLowerCase().includes(term),
    );
  }

  get recentSales(): Sale[] {
    return [...this.data.sales].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, 8);
  }

  get canceledSalesReport(): Sale[] {
    return this.data.sales
      .filter((sale) => this.isSaleCanceled(sale))
      .sort((a, b) => Date.parse(b.canceledAt ?? b.createdAt) - Date.parse(a.canceledAt ?? a.createdAt));
  }

  get lowStockProducts(): Product[] {
    return this.data.products.filter((product) => product.stock <= product.minStock);
  }

  get sortedPayments(): Payment[] {
    return [...this.data.payments].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  }

  get saleDraftTotal(): number {
    return this.saleForm.items.reduce((sum, item) => {
      const product = this.findProduct(item.productId);
      return sum + (product ? product.price * Number(item.quantity || 0) : 0);
    }, 0);
  }

  get productSalesReport(): Array<{ name: string; quantity: number; percent: number }> {
    const rows = this.data.products.map((product) => {
      const quantity = this.activeSales().reduce((sum, sale) => {
        const item = sale.items.find((saleItem) => saleItem.productId === product.id);
        return sum + (item ? item.quantity : 0);
      }, 0);
      return { name: product.name, quantity };
    });
    const max = Math.max(1, ...rows.map((row) => row.quantity));
    return rows
      .sort((a, b) => b.quantity - a.quantity)
      .map((row) => ({ ...row, percent: (row.quantity / max) * 100 }));
  }

  get stockReport(): Array<{ name: string; quantity: number; percent: number }> {
    const max = Math.max(1, ...this.data.products.map((product) => product.stock));
    return this.data.products.map((product) => ({
      name: product.name,
      quantity: product.stock,
      percent: (product.stock / max) * 100,
    }));
  }

  login(): void {
    const user = this.data.users.find(
      (item) =>
        item.username === this.loginForm.username.trim() &&
        item.password === this.loginForm.password &&
        item.active,
    );

    if (!user) {
      this.loginError = 'Usuario ou senha invalidos.';
      return;
    }

    this.currentUser = user;
    this.loginError = '';
    this.loginForm = { username: '', password: '' };
  }

  logout(): void {
    this.currentUser = null;
    this.activeView = 'dashboard';
  }

  setView(view: ViewName): void {
    this.activeView = view;
  }

  saveUser(): void {
    const payload: User = {
      id: this.editingUserId ?? crypto.randomUUID(),
      name: this.userForm.name.trim(),
      username: this.userForm.username.trim(),
      password: this.userForm.password,
      role: this.userForm.role,
      active: this.userForm.active,
    };

    const exists = this.data.users.some((user) => user.username === payload.username && user.id !== payload.id);
    if (exists) {
      alert('Esse nome de usuario ja esta em uso.');
      return;
    }

    if (this.editingUserId) {
      this.data.users = this.data.users.map((user) => (user.id === payload.id ? payload : user));
    } else {
      this.data.users = [...this.data.users, payload];
    }

    this.editingUserId = null;
    this.userForm = this.emptyUserForm();
    this.persist();
  }

  editUser(user: User): void {
    this.editingUserId = user.id;
    this.userForm = { ...user };
  }

  deleteUser(user: User): void {
    if (this.data.users.length === 1) {
      alert('Mantenha pelo menos um usuario cadastrado.');
      return;
    }
    if (!confirm('Excluir este usuario?')) return;
    this.data.users = this.data.users.filter((item) => item.id !== user.id);
    this.persist();
  }

  saveProduct(): void {
    const payload: Product = {
      id: this.editingProductId ?? crypto.randomUUID(),
      name: this.productForm.name.trim(),
      sku: this.productForm.sku.trim(),
      price: Number(this.productForm.price),
      stock: Number(this.productForm.stock),
      minStock: Number(this.productForm.minStock),
    };

    if (this.editingProductId) {
      this.data.products = this.data.products.map((product) => (product.id === payload.id ? payload : product));
    } else {
      this.data.products = [...this.data.products, payload];
    }

    this.editingProductId = null;
    this.productForm = this.emptyProductForm();
    this.persist();
  }

  editProduct(product: Product): void {
    this.editingProductId = product.id;
    this.productForm = { ...product };
  }

  deleteProduct(product: Product): void {
    if (!confirm('Excluir este produto?')) return;
    this.data.products = this.data.products.filter((item) => item.id !== product.id);
    this.persist();
  }

  saveClient(): void {
    const payload: Client = {
      id: this.editingClientId ?? crypto.randomUUID(),
      name: this.clientForm.name.trim(),
      document: this.clientForm.document.trim(),
      phone: this.clientForm.phone.trim(),
      email: this.clientForm.email.trim(),
    };

    if (this.editingClientId) {
      this.data.clients = this.data.clients.map((client) => (client.id === payload.id ? payload : client));
    } else {
      this.data.clients = [...this.data.clients, payload];
    }

    this.editingClientId = null;
    this.clientForm = this.emptyClientForm();
    this.persist();
  }

  editClient(client: Client): void {
    this.editingClientId = client.id;
    this.clientForm = { ...client };
  }

  deleteClient(client: Client): void {
    if (!confirm('Excluir este cliente?')) return;
    this.data.clients = this.data.clients.filter((item) => item.id !== client.id);
    this.persist();
  }

  addSaleItem(): void {
    this.saleForm.items = [...this.saleForm.items, { productId: '', quantity: 1 }];
  }

  removeSaleItem(index: number): void {
    this.saleForm.items = this.saleForm.items.filter((_, itemIndex) => itemIndex !== index);
    if (!this.saleForm.items.length) this.addSaleItem();
  }

  finishSale(): void {
    const items = this.saleForm.items
      .map((item) => ({ product: this.findProduct(item.productId), quantity: Number(item.quantity) }))
      .filter((item): item is { product: Product; quantity: number } => Boolean(item.product));

    if (!this.saleForm.clientId || !items.length) {
      alert('Selecione um cliente e pelo menos um produto.');
      return;
    }

    const unavailable = items.find(({ product, quantity }) => quantity <= 0 || quantity > product.stock);
    if (unavailable) {
      alert(`Estoque insuficiente para ${unavailable.product.name}.`);
      return;
    }

    const saleItems = items.map(({ product, quantity }) => {
      product.stock -= quantity;
      return {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity,
      };
    });

    const sale: Sale = {
      id: crypto.randomUUID(),
      clientId: this.saleForm.clientId,
      items: saleItems,
      paymentMethod: this.saleForm.paymentMethod,
      createdAt: new Date().toISOString(),
      status: 'Ativa',
    };

    this.data.sales = [...this.data.sales, sale];
    this.data.payments = [
      ...this.data.payments,
      {
        id: crypto.randomUUID(),
        saleId: sale.id,
        amount: this.saleTotal(sale),
        method: sale.paymentMethod,
        description: 'Pagamento de venda',
        createdAt: sale.createdAt,
      },
    ];

    this.saleForm = { clientId: '', paymentMethod: 'Dinheiro', items: [{ productId: '', quantity: 1 }] };
    this.persist();
  }

  cancelSale(sale: Sale): void {
    if (this.isSaleCanceled(sale)) {
      alert('Esta venda ja esta cancelada.');
      return;
    }

    const reason = prompt('Informe a justificativa para cancelar esta compra:')?.trim();
    if (!reason) {
      alert('A justificativa e obrigatoria para efetuar o cancelamento.');
      return;
    }

    if (!confirm('Confirmar cancelamento desta compra?')) return;

    sale.items.forEach((item) => {
      const product = this.findProduct(item.productId);
      if (product) product.stock += item.quantity;
    });

    sale.status = 'Cancelada';
    sale.cancellationReason = reason;
    sale.canceledAt = new Date().toISOString();
    sale.canceledBy = this.currentUser?.name ?? 'Usuario';

    this.data.payments = [
      ...this.data.payments,
      {
        id: crypto.randomUUID(),
        saleId: sale.id,
        amount: -this.saleTotal(sale),
        method: sale.paymentMethod,
        description: `Cancelamento de venda: ${reason}`,
        createdAt: sale.canceledAt,
      },
    ];

    this.persist();
  }

  savePayment(): void {
    if (Number(this.paymentForm.amount) <= 0) {
      alert('Informe um valor maior que zero.');
      return;
    }

    this.data.payments = [
      ...this.data.payments,
      {
        id: crypto.randomUUID(),
        saleId: null,
        amount: Number(this.paymentForm.amount),
        method: this.paymentForm.method,
        description: this.paymentForm.description.trim(),
        createdAt: new Date().toISOString(),
      },
    ];
    this.paymentForm = { description: '', amount: 0, method: 'Dinheiro' };
    this.persist();
  }

  restoreDemo(): void {
    if (!confirm('Restaurar os dados de demonstracao?')) return;
    this.data = this.demoData();
    this.persist();
  }

  saleTotal(sale: Sale): number {
    return sale.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  isSaleCanceled(sale: Sale): boolean {
    return sale.status === 'Cancelada';
  }

  findClient(clientId: string): Client | undefined {
    return this.data.clients.find((client) => client.id === clientId);
  }

  findProduct(productId: string): Product | undefined {
    return this.data.products.find((product) => product.id === productId);
  }

  formatDate(value: string): string {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  private currentMonthSales(): Sale[] {
    const now = new Date();
    return this.activeSales().filter((sale) => {
      const date = new Date(sale.createdAt);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
  }

  private activeSales(): Sale[] {
    return this.data.sales.filter((sale) => !this.isSaleCanceled(sale));
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
  }

  private loadData(): StoreData {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved) as StoreData;

    const demo = this.demoData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demo));
    return demo;
  }

  private demoData(): StoreData {
    return {
      users: [
        {
          id: crypto.randomUUID(),
          name: 'Administrador',
          username: 'admin',
          password: 'admin123',
          role: 'Administrador',
          active: true,
        },
      ],
      products: [
        { id: crypto.randomUUID(), name: 'Teclado mecanico', sku: 'TEC-001', price: 220, stock: 18, minStock: 5 },
        { id: crypto.randomUUID(), name: 'Mouse sem fio', sku: 'MOU-002', price: 95, stock: 30, minStock: 8 },
        { id: crypto.randomUUID(), name: 'Monitor 24 pol', sku: 'MON-003', price: 780, stock: 7, minStock: 3 },
      ],
      clients: [
        {
          id: crypto.randomUUID(),
          name: 'Mariana Costa',
          document: '123.456.789-00',
          phone: '(11) 98888-1000',
          email: 'mariana@email.com',
        },
      ],
      sales: [],
      payments: [],
    };
  }

  private emptyUserForm(): User {
    return {
      id: '',
      name: '',
      username: '',
      password: '',
      role: 'Operador',
      active: true,
    };
  }

  private emptyProductForm(): Product {
    return {
      id: '',
      name: '',
      sku: '',
      price: 0,
      stock: 0,
      minStock: 0,
    };
  }

  private emptyClientForm(): Client {
    return {
      id: '',
      name: '',
      document: '',
      phone: '',
      email: '',
    };
  }
}
