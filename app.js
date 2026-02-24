// ===== BANCO DE DADOS (localStorage) =====
const DB = {
    get: (key) => JSON.parse(localStorage.getItem(key) || '[]'),
    set: (key, data) => localStorage.setItem(key, JSON.stringify(data)),
    uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
};

const KEYS = { veiculos: 'ag_veiculos', compras: 'ag_compras', vendas: 'ag_vendas' };

// ===== UTILITÁRIOS =====
const fmt = {
    currency: (v) => {
        const n = parseFloat(v) || 0;
        return n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    },
    date: (s) => {
        if (!s) return '—';
        const [y, m, d] = s.split('-');
        return `${d}/${m}/${y}`;
    },
    parseCurrency: (s) => {
        if (!s) return 0;
        return parseFloat(s.toString().replace(/\./g, '').replace(',', '.')) || 0;
    }
};

function toast(msg, type = 'info') {
    const tc = document.getElementById('toastContainer');
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    const icons = { success: 'fa-check-circle', error: 'fa-circle-xmark', info: 'fa-circle-info' };
    el.innerHTML = `<i class="fa-solid ${icons[type] || icons.info}"></i> ${msg}`;
    tc.appendChild(el);
    setTimeout(() => el.remove(), 3200);
}

function openModal(id) { document.getElementById(id).classList.add('open'); }
function closeModal(id) { document.getElementById(id).classList.remove('open'); }

// Formata inputs de moeda
function setupCurrencyInputs() {
    document.querySelectorAll('.currency-input:not([readonly])').forEach(inp => {
        inp.addEventListener('input', function () {
            let raw = this.value.replace(/\D/g, '');
            if (!raw) { this.value = ''; return; }
            let num = parseInt(raw, 10) / 100;
            this.value = num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        });
    });
}
function currencyVal(id) { return fmt.parseCurrency(document.getElementById(id).value); }
function setCurrencyVal(id, v) {
    const el = document.getElementById(id);
    if (!el) return;
    el.value = v ? v.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '';
}

// ===== NAVEGAÇÃO =====
const pageTitles = {
    dashboard: 'Dashboard', veiculos: 'Veículos', compras: 'Compras',
    vendas: 'Vendas', relatorios: 'Relatórios'
};
function navigate(page) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(`page-${page}`).classList.add('active');
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    document.getElementById('pageTitle').textContent = pageTitles[page];
    if (page === 'dashboard') renderDashboard();
    if (page === 'veiculos') renderVeiculos();
    if (page === 'compras') renderCompras();
    if (page === 'vendas') renderVendas();
    if (page === 'relatorios') renderRelatorios();
}

// ===== VEÍCULOS =====
function renderVeiculos(filter = '') {
    const veiculos = DB.get(KEYS.veiculos);
    const tbody = document.getElementById('veiculosBody');
    const list = filter
        ? veiculos.filter(v => `${v.marca} ${v.modelo} ${v.placa}`.toLowerCase().includes(filter.toLowerCase()))
        : veiculos;
    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="9" class="empty-row">Nenhum veículo cadastrado</td></tr>`;
        return;
    }
    tbody.innerHTML = list.map(v => `
    <tr>
      <td><strong>${v.placa}</strong></td>
      <td>${v.marca} ${v.modelo}</td>
      <td>${v.anoFab}${v.anoMod && v.anoMod !== v.anoFab ? `/${v.anoMod}` : ''}</td>
      <td>${v.cor}</td>
      <td>${v.combustivel}</td>
      <td><span class="badge ${statusBadge(v.status)}">${v.status}</span></td>
      <td>${fmt.currency(v.precoCompra)}</td>
      <td>${v.precoVenda ? fmt.currency(v.precoVenda) : '—'}</td>
      <td>
        <button class="btn-icon" onclick="editarVeiculo('${v.id}')" title="Editar"><i class="fa-solid fa-pen"></i></button>
        <button class="btn-icon delete" onclick="deletarRegistro('veiculo','${v.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`).join('');
}

function statusBadge(s) {
    const map = { 'Em estoque': 'badge-blue', 'Vendido': 'badge-success', 'Reservado': 'badge-gray' };
    return map[s] || 'badge-gray';
}

function abrirModalVeiculo() {
    document.getElementById('formVeiculo').reset();
    document.getElementById('veiculoId').value = '';
    document.getElementById('modalVeiculoTitle').textContent = 'Cadastrar Veículo';
    openModal('modalVeiculo');
}

function editarVeiculo(id) {
    const v = DB.get(KEYS.veiculos).find(x => x.id === id);
    if (!v) return;
    document.getElementById('veiculoId').value = v.id;
    document.getElementById('vPlaca').value = v.placa;
    document.getElementById('vMarca').value = v.marca;
    document.getElementById('vModelo').value = v.modelo;
    document.getElementById('vAnoFab').value = v.anoFab;
    document.getElementById('vAnoMod').value = v.anoMod || '';
    document.getElementById('vCor').value = v.cor;
    document.getElementById('vCombustivel').value = v.combustivel;
    document.getElementById('vCambio').value = v.cambio;
    document.getElementById('vKm').value = v.km || '';
    setCurrencyVal('vPrecoCompra', v.precoCompra);
    setCurrencyVal('vPrecoVenda', v.precoVenda);
    document.getElementById('vObs').value = v.obs || '';
    document.getElementById('modalVeiculoTitle').textContent = 'Editar Veículo';
    openModal('modalVeiculo');
}

function salvarVeiculo() {
    const placa = document.getElementById('vPlaca').value.trim();
    const marca = document.getElementById('vMarca').value.trim();
    const modelo = document.getElementById('vModelo').value.trim();
    const anoFab = document.getElementById('vAnoFab').value;
    const cor = document.getElementById('vCor').value.trim();
    const preco = currencyVal('vPrecoCompra');
    if (!placa || !marca || !modelo || !anoFab || !cor || !preco) {
        toast('Preencha todos os campos obrigatórios (*)', 'error'); return;
    }
    const veiculos = DB.get(KEYS.veiculos);
    const id = document.getElementById('veiculoId').value;
    const dados = {
        id: id || DB.uid(),
        placa: placa.toUpperCase(),
        marca, modelo,
        anoFab: parseInt(anoFab),
        anoMod: parseInt(document.getElementById('vAnoMod').value) || parseInt(anoFab),
        cor,
        combustivel: document.getElementById('vCombustivel').value,
        cambio: document.getElementById('vCambio').value,
        km: parseInt(document.getElementById('vKm').value) || 0,
        precoCompra: preco,
        precoVenda: currencyVal('vPrecoVenda'),
        obs: document.getElementById('vObs').value,
        status: 'Em estoque',
        criadoEm: new Date().toISOString()
    };
    if (id) {
        const idx = veiculos.findIndex(x => x.id === id);
        dados.status = veiculos[idx].status; // mantém status
        veiculos[idx] = { ...veiculos[idx], ...dados };
        toast('Veículo atualizado!', 'success');
    } else {
        veiculos.push(dados);
        toast('Veículo cadastrado!', 'success');
    }
    DB.set(KEYS.veiculos, veiculos);
    closeModal('modalVeiculo');
    renderVeiculos();
}

// ===== COMPRAS =====
function renderCompras() {
    const compras = DB.get(KEYS.compras);
    const veiculos = DB.get(KEYS.veiculos);
    const tbody = document.getElementById('comprasBody');
    if (!compras.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="empty-row">Nenhuma compra registrada</td></tr>`;
        return;
    }
    tbody.innerHTML = compras.map(c => {
        const v = veiculos.find(x => x.id === c.veiculoId);
        const nomeV = v ? `${v.placa} — ${v.marca} ${v.modelo}` : 'Veículo removido';
        return `<tr>
      <td>${fmt.date(c.data)}</td>
      <td>${nomeV}</td>
      <td>${c.fornecedor || '—'}</td>
      <td><strong>${fmt.currency(c.valor)}</strong></td>
      <td>${c.obs || '—'}</td>
      <td>
        <button class="btn-icon delete" onclick="deletarRegistro('compra','${c.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`;
    }).join('');
}

function abrirModalCompra() {
    document.getElementById('formCompra').reset();
    document.getElementById('compraId').value = '';
    document.getElementById('cData').value = new Date().toISOString().split('T')[0];
    preencherSelectVeiculos('cVeiculo', false);
    openModal('modalCompra');
}

function salvarCompra() {
    const data = document.getElementById('cData').value;
    const veiculoId = document.getElementById('cVeiculo').value;
    const valor = currencyVal('cValor');
    if (!data || !veiculoId || !valor) {
        toast('Preencha todos os campos obrigatórios (*)', 'error'); return;
    }
    const compras = DB.get(KEYS.compras);
    const compra = {
        id: DB.uid(), data, veiculoId,
        fornecedor: document.getElementById('cFornecedor').value.trim(),
        valor,
        obs: document.getElementById('cObs').value.trim(),
        criadoEm: new Date().toISOString()
    };
    // Atualiza preço de compra no veículo
    const veiculos = DB.get(KEYS.veiculos);
    const vi = veiculos.findIndex(x => x.id === veiculoId);
    if (vi !== -1) {
        veiculos[vi].precoCompra = valor;
        DB.set(KEYS.veiculos, veiculos);
    }
    compras.push(compra);
    DB.set(KEYS.compras, compras);
    toast('Compra registrada!', 'success');
    closeModal('modalCompra');
    renderCompras();
}

// ===== VENDAS =====
function renderVendas() {
    const vendas = DB.get(KEYS.vendas);
    const veiculos = DB.get(KEYS.veiculos);
    const tbody = document.getElementById('vendasBody');
    if (!vendas.length) {
        tbody.innerHTML = `<tr><td colspan="8" class="empty-row">Nenhuma venda registrada</td></tr>`;
        return;
    }
    tbody.innerHTML = vendas.map(vd => {
        const v = veiculos.find(x => x.id === vd.veiculoId);
        const nomeV = v ? `${v.placa} — ${v.marca} ${v.modelo}` : 'Veículo removido';
        const lucro = vd.valorVenda - vd.custo;
        const margem = vd.custo > 0 ? ((lucro / vd.custo) * 100).toFixed(1) : '—';
        const lucroClass = lucro >= 0 ? 'color:#166534' : 'color:#991b1b';
        return `<tr>
      <td>${fmt.date(vd.data)}</td>
      <td>${nomeV}</td>
      <td>${vd.comprador || '—'}</td>
      <td>${fmt.currency(vd.custo)}</td>
      <td><strong>${fmt.currency(vd.valorVenda)}</strong></td>
      <td style="${lucroClass}"><strong>${fmt.currency(lucro)}</strong></td>
      <td>${margem !== '—' ? margem + '%' : '—'}</td>
      <td>
        <button class="btn-icon delete" onclick="deletarRegistro('venda','${vd.id}')" title="Excluir"><i class="fa-solid fa-trash"></i></button>
      </td>
    </tr>`;
    }).join('');
}

function abrirModalVenda() {
    document.getElementById('formVenda').reset();
    document.getElementById('vendaId').value = '';
    document.getElementById('vdData').value = new Date().toISOString().split('T')[0];
    document.getElementById('vdCusto').value = '';
    document.getElementById('vdLucro').value = '';
    preencherSelectVeiculos('vdVeiculo', true);
    openModal('modalVenda');
}

function salvarVenda() {
    const data = document.getElementById('vdData').value;
    const veiculoId = document.getElementById('vdVeiculo').value;
    const valorVenda = currencyVal('vdValor');
    if (!data || !veiculoId || !valorVenda) {
        toast('Preencha todos os campos obrigatórios (*)', 'error'); return;
    }
    const veiculos = DB.get(KEYS.veiculos);
    const vi = veiculos.findIndex(x => x.id === veiculoId);
    const custo = vi !== -1 ? veiculos[vi].precoCompra : 0;

    const vendas = DB.get(KEYS.vendas);
    const venda = {
        id: DB.uid(), data, veiculoId,
        comprador: document.getElementById('vdComprador').value.trim(),
        valorVenda, custo,
        obs: document.getElementById('vdObs').value.trim(),
        criadoEm: new Date().toISOString()
    };
    // Marca veículo como vendido
    if (vi !== -1) {
        veiculos[vi].status = 'Vendido';
        veiculos[vi].precoVenda = valorVenda;
        DB.set(KEYS.veiculos, veiculos);
    }
    vendas.push(venda);
    DB.set(KEYS.vendas, vendas);
    toast('Venda registrada com sucesso!', 'success');
    closeModal('modalVenda');
    renderVendas();
}

// ===== SELECT DE VEÍCULOS =====
function preencherSelectVeiculos(selectId, apenasEstoque) {
    const sel = document.getElementById(selectId);
    const veiculos = DB.get(KEYS.veiculos);
    const lista = apenasEstoque ? veiculos.filter(v => v.status === 'Em estoque') : veiculos;
    sel.innerHTML = `<option value="">Selecione...</option>` +
        lista.map(v => `<option value="${v.id}">${v.placa} — ${v.marca} ${v.modelo} (${v.anoFab})</option>`).join('');
}

// ===== DASHBOARD =====
function renderDashboard() {
    const veiculos = DB.get(KEYS.veiculos);
    const compras = DB.get(KEYS.compras);
    const vendas = DB.get(KEYS.vendas);

    const estoque = veiculos.filter(v => v.status === 'Em estoque').length;
    const totalInvestido = compras.reduce((s, c) => s + c.valor, 0);
    const totalRecebido = vendas.reduce((s, v) => s + v.valorVenda, 0);
    const totalCusto = vendas.reduce((s, v) => s + v.custo, 0);
    const lucro = totalRecebido - totalCusto;

    document.getElementById('dash-estoque').textContent = estoque;
    document.getElementById('dash-investido').textContent = fmt.currency(totalInvestido);
    document.getElementById('dash-recebido').textContent = fmt.currency(totalRecebido);
    document.getElementById('dash-lucro').textContent = fmt.currency(lucro);

    // Últimas movimentações
    const movs = [
        ...compras.map(c => ({ data: c.data, tipo: 'Compra', veiculoId: c.veiculoId, valor: c.valor, criadoEm: c.criadoEm })),
        ...vendas.map(v => ({ data: v.data, tipo: 'Venda', veiculoId: v.veiculoId, valor: v.valorVenda, criadoEm: v.criadoEm }))
    ].sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm)).slice(0, 10);

    const veics = DB.get(KEYS.veiculos);
    const tbody = document.getElementById('dash-movimentacoes-body');
    if (!movs.length) {
        tbody.innerHTML = `<tr><td colspan="4" class="empty-row">Nenhuma movimentação</td></tr>`;
        return;
    }
    tbody.innerHTML = movs.map(m => {
        const v = veics.find(x => x.id === m.veiculoId);
        const nomeV = v ? `${v.placa} — ${v.marca} ${v.modelo}` : 'Unknown';
        const tipoClass = m.tipo === 'Venda' ? 'badge-success' : 'badge-blue';
        return `<tr>
      <td>${fmt.date(m.data)}</td>
      <td><span class="badge ${tipoClass}">${m.tipo}</span></td>
      <td>${nomeV}</td>
      <td><strong>${fmt.currency(m.valor)}</strong></td>
    </tr>`;
    }).join('');
}

// ===== RELATÓRIOS =====
function renderRelatorios() {
    const vendas = DB.get(KEYS.vendas);
    const veiculos = DB.get(KEYS.veiculos);
    const compras = DB.get(KEYS.compras);

    const totalVendidos = vendas.length;
    let somaMargens = 0, maiorLucro = 0;
    let estoqueValor = veiculos
        .filter(v => v.status === 'Em estoque')
        .reduce((s, v) => s + (v.precoCompra || 0), 0);

    const tbody = document.getElementById('relatoriosBody');
    if (!vendas.length) {
        tbody.innerHTML = `<tr><td colspan="7" class="empty-row">Nenhuma venda registrada</td></tr>`;
        document.getElementById('rel-vendidos').textContent = 0;
        document.getElementById('rel-margem').textContent = '0%';
        document.getElementById('rel-maior-lucro').textContent = fmt.currency(0);
        document.getElementById('rel-estoque-valor').textContent = fmt.currency(estoqueValor);
        return;
    }

    let rows = '';
    vendas.forEach(vd => {
        const v = veiculos.find(x => x.id === vd.veiculoId);
        const nomeV = v ? `${v.placa} — ${v.marca} ${v.modelo}` : 'Unknown';
        const lucro = vd.valorVenda - vd.custo;
        const margem = vd.custo > 0 ? (lucro / vd.custo) * 100 : 0;
        somaMargens += margem;
        if (lucro > maiorLucro) maiorLucro = lucro;

        // Data de compra
        const compra = compras.find(c => c.veiculoId === vd.veiculoId);
        const dataCompra = compra ? fmt.date(compra.data) : '—';
        const lucroClass = lucro >= 0 ? 'color:#166534' : 'color:#991b1b';
        rows += `<tr>
      <td>${dataCompra}</td>
      <td>${fmt.date(vd.data)}</td>
      <td>${nomeV}</td>
      <td>${fmt.currency(vd.custo)}</td>
      <td>${fmt.currency(vd.valorVenda)}</td>
      <td style="${lucroClass}"><strong>${fmt.currency(lucro)}</strong></td>
      <td>${margem.toFixed(1)}%</td>
    </tr>`;
    });

    tbody.innerHTML = rows;
    const margemMedia = totalVendidos > 0 ? (somaMargens / totalVendidos).toFixed(1) : 0;
    document.getElementById('rel-vendidos').textContent = totalVendidos;
    document.getElementById('rel-margem').textContent = `${margemMedia}%`;
    document.getElementById('rel-maior-lucro').textContent = fmt.currency(maiorLucro);
    document.getElementById('rel-estoque-valor').textContent = fmt.currency(estoqueValor);
}

// ===== EXCLUSÃO =====
let deleteCb = null;
function deletarRegistro(tipo, id) {
    const msgs = {
        veiculo: 'Tem certeza que deseja excluir este veículo? Isso não removerá compras ou vendas associadas.',
        compra: 'Tem certeza que deseja excluir esta compra?',
        venda: 'Tem certeza que deseja excluir esta venda? O status do veículo voltará para "Em estoque".'
    };
    document.getElementById('confirmMsg').textContent = msgs[tipo];
    deleteCb = () => {
        if (tipo === 'veiculo') {
            const arr = DB.get(KEYS.veiculos).filter(x => x.id !== id);
            DB.set(KEYS.veiculos, arr); renderVeiculos();
        } else if (tipo === 'compra') {
            const arr = DB.get(KEYS.compras).filter(x => x.id !== id);
            DB.set(KEYS.compras, arr); renderCompras();
        } else if (tipo === 'venda') {
            const venda = DB.get(KEYS.vendas).find(x => x.id === id);
            if (venda) {
                const veics = DB.get(KEYS.veiculos);
                const vi = veics.findIndex(x => x.id === venda.veiculoId);
                if (vi !== -1) { veics[vi].status = 'Em estoque'; DB.set(KEYS.veiculos, veics); }
            }
            const arr = DB.get(KEYS.vendas).filter(x => x.id !== id);
            DB.set(KEYS.vendas, arr); renderVendas();
        }
        toast('Registro excluído', 'success');
        closeModal('modalConfirm');
    };
    openModal('modalConfirm');
}

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
    setupCurrencyInputs();

    // Data no topo
    const now = new Date();
    document.getElementById('dateDisplay').textContent =
        now.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

    // Navegação
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', e => {
            e.preventDefault();
            navigate(item.dataset.page);
        });
    });

    // Sidebar toggle
    const sidebar = document.getElementById('sidebar');
    const main = document.querySelector('.main-content');
    document.getElementById('btnToggle').addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
        main.classList.toggle('expanded');
    });

    // Fechar modais com overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', e => {
            if (e.target === overlay) overlay.classList.remove('open');
        });
    });

    // Botões de fechar modal
    document.querySelectorAll('[data-close]').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.dataset.close));
    });

    // Botões de ação
    document.getElementById('btnNovoVeiculo').addEventListener('click', abrirModalVeiculo);
    document.getElementById('btnSalvarVeiculo').addEventListener('click', salvarVeiculo);
    document.getElementById('btnNovaCompra').addEventListener('click', abrirModalCompra);
    document.getElementById('btnSalvarCompra').addEventListener('click', salvarCompra);
    document.getElementById('btnNovaVenda').addEventListener('click', abrirModalVenda);
    document.getElementById('btnSalvarVenda').addEventListener('click', salvarVenda);
    document.getElementById('btnConfirmDelete').addEventListener('click', () => { if (deleteCb) deleteCb(); });

    // Busca de veículos
    document.getElementById('searchVeiculos').addEventListener('input', e => {
        renderVeiculos(e.target.value);
    });

    // Calcular lucro na venda ao selecionar veículo ou digitar valor
    document.getElementById('vdVeiculo').addEventListener('change', function () {
        const veiculos = DB.get(KEYS.veiculos);
        const v = veiculos.find(x => x.id === this.value);
        if (v) {
            setCurrencyVal('vdCusto', v.precoCompra);
            atualizarLucroVenda();
            if (v.precoVenda) setCurrencyVal('vdValor', v.precoVenda);
        } else {
            document.getElementById('vdCusto').value = '';
            document.getElementById('vdLucro').value = '';
        }
    });

    document.getElementById('vdValor').addEventListener('input', atualizarLucroVenda);

    // Render inicial
    renderDashboard();
});

function atualizarLucroVenda() {
    const venda = currencyVal('vdValor');
    const custo = currencyVal('vdCusto');
    if (venda && custo) setCurrencyVal('vdLucro', venda - custo);
    else document.getElementById('vdLucro').value = '';
}
