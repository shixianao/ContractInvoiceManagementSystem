<template>
  <div class="invoice-management">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入发票编号或合同名称"
        prefix-icon="el-icon-search"
        style="width: 300px; margin-right: 10px"
        @input="handleSearch"
      />
      <el-button type="primary" @click="openAddDialog" icon="el-icon-plus">新增发票</el-button>
    </div>

    <!-- 发票列表 -->
    <el-table
      :data="paginatedInvoices"
      style="width: 100%; margin-top: 20px"
      stripe
      :header-cell-style="{ background: '#333', color: '#fff' }"
      :row-style="{ background: '#262626', color: '#fff' }"
    >
      <el-table-column prop="invoiceNumber" label="发票编号" width="150" />
      <el-table-column prop="contractName" label="关联合同" min-width="200" />
      <el-table-column prop="invoiceAmount" label="发票金额" width="120" align="right">
        <template slot-scope="scope">{{ scope.row.invoiceAmount.toFixed(2) }}元</template>
      </el-table-column>
      <el-table-column prop="invoiceDate" label="开票日期" width="120" />
      <el-table-column prop="taxRate" label="税率" width="80" align="right">
        <template slot-scope="scope">{{ scope.row.taxRate * 100 }}%</template>
      </el-table-column>
      <el-table-column prop="taxAmount" label="税额" width="120" align="right">
        <template slot-scope="scope">{{ scope.row.taxAmount.toFixed(2) }}元</template>
      </el-table-column>
      <el-table-column prop="totalAmount" label="价税合计" width="120" align="right">
        <template slot-scope="scope">{{ scope.row.totalAmount.toFixed(2) }}元</template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === '已开票' ? 'success' : '未开票'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="openEditDialog(scope.row)" style="margin-right: 5px">编辑</el-button>
          <el-button type="danger" size="small" @click="deleteInvoice(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="currentPage"
        :page-sizes="[10, 20, 50]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next"
        :total="filteredInvoices.length"
      />
    </div>

    <!-- 新增/编辑发票对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      @close="resetForm"
    >
      <el-form :model="invoiceForm" :rules="invoiceRules" ref="invoiceForm" label-width="120px">
        <el-form-item label="发票编号" prop="invoiceNumber">
          <el-input v-model="invoiceForm.invoiceNumber" placeholder="请输入发票编号" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="关联合同" prop="contractId">
          <el-select v-model="invoiceForm.contractId" placeholder="请选择关联合同" style="width: 100%" @change="handleContractChange">
            <el-option
              v-for="contract in contracts"
              :key="contract.id"
              :label="`${contract.contractNumber} - ${contract.contractName}`"
              :value="contract.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="发票金额" prop="invoiceAmount">
          <el-input-number
            v-model="invoiceForm.invoiceAmount"
            placeholder="请输入发票金额"
            :min="0"
            :precision="2"
            style="width: 100%"
            @change="calculateTax"
          />
        </el-form-item>
        <el-form-item label="税率" prop="taxRate">
          <el-select v-model="invoiceForm.taxRate" placeholder="请选择税率" style="width: 100%" @change="calculateTax">
            <el-option label="13%" value="0.13" />
            <el-option label="9%" value="0.09" />
            <el-option label="6%" value="0.06" />
            <el-option label="3%" value="0.03" />
            <el-option label="0%" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="税额" prop="taxAmount">
          <el-input-number
            v-model="invoiceForm.taxAmount"
            placeholder="税额"
            :min="0"
            :precision="2"
            style="width: 100%"
            :disabled="true"
          />
        </el-form-item>
        <el-form-item label="价税合计" prop="totalAmount">
          <el-input-number
            v-model="invoiceForm.totalAmount"
            placeholder="价税合计"
            :min="0"
            :precision="2"
            style="width: 100%"
            :disabled="true"
          />
        </el-form-item>
        <el-form-item label="开票日期" prop="invoiceDate">
          <el-date-picker v-model="invoiceForm.invoiceDate" type="date" placeholder="选择开票日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="invoiceForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="已开票" value="已开票" />
            <el-option label="未开票" value="未开票" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="invoiceForm.remark" type="textarea" placeholder="请输入备注" :rows="3" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveInvoice">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'InvoiceManagement',
  data() {
    return {
      invoices: [],
      filteredInvoices: [],
      paginatedInvoices: [],
      contracts: [],
      searchKeyword: '',
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      isEdit: false,
      dialogTitle: '',
      invoiceForm: {
        id: '',
        invoiceNumber: '',
        contractId: '',
        contractName: '',
        invoiceAmount: 0,
        taxRate: 0.13,
        taxAmount: 0,
        totalAmount: 0,
        invoiceDate: '',
        status: '已开票',
        remark: ''
      },
      invoiceRules: {
        invoiceNumber: [
          { required: true, message: '请输入发票编号', trigger: 'blur' },
          { validator: this.checkInvoiceNumberUnique, trigger: 'blur' }
        ],
        contractId: [
          { required: true, message: '请选择关联合同', trigger: 'change' }
        ],
        invoiceAmount: [
          { required: true, message: '请输入发票金额', trigger: 'blur' }
        ],
        taxRate: [
          { required: true, message: '请选择税率', trigger: 'change' }
        ],
        invoiceDate: [
          { required: true, message: '请选择开票日期', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  },
  mounted() {
    this.loadData()
  },
  watch: {
    filteredInvoices: function() {
      this.paginateData()
    },
    currentPage: function() {
      this.paginateData()
    },
    pageSize: function() {
      this.paginateData()
    }
  },
  methods: {
    // 加载数据
    loadData() {
      // 加载合同数据
      const contracts = window.localStorage.getItem('contracts')
      this.contracts = contracts ? JSON.parse(contracts) : []

      // 加载发票数据
      const invoices = window.localStorage.getItem('invoices')
      if (invoices) {
        this.invoices = JSON.parse(invoices)
        // 补充合同名称
        this.invoices.forEach(invoice => {
          const contract = this.contracts.find(c => c.id === invoice.contractId)
          invoice.contractName = contract ? `${contract.contractNumber} - ${contract.contractName}` : ''
        })
      } else {
        // 初始化一些示例数据
        this.invoices = [
          {
            id: Date.now() + 1,
            invoiceNumber: 'FP2024001',
            contractId: this.contracts.length > 0 ? this.contracts[0].id : '',
            contractName: this.contracts.length > 0 ? `${this.contracts[0].contractNumber} - ${this.contracts[0].contractName}` : '',
            invoiceAmount: 44247.79,
            taxRate: 0.13,
            taxAmount: 5752.21,
            totalAmount: 50000.00,
            invoiceDate: '2024-01-25',
            status: '已开票',
            remark: '这是一张发票示例'
          }
        ]
        this.saveToLocalStorage()
      }
      this.filteredInvoices = [...this.invoices]
    },

    // 保存到本地存储
    saveToLocalStorage() {
      window.localStorage.setItem('invoices', JSON.stringify(this.invoices))
    },

    // 分页处理
    paginateData() {
      const startIndex = (this.currentPage - 1) * this.pageSize
      const endIndex = startIndex + this.pageSize
      this.paginatedInvoices = this.filteredInvoices.slice(startIndex, endIndex)
    },

    // 搜索
    handleSearch() {
      if (!this.searchKeyword) {
        this.filteredInvoices = [...this.invoices]
      } else {
        this.filteredInvoices = this.invoices.filter(invoice => 
          invoice.invoiceNumber.includes(this.searchKeyword) ||
          invoice.contractName.includes(this.searchKeyword)
        )
      }
      this.currentPage = 1
    },

    // 分页
    handleSizeChange(val) {
      this.pageSize = val
    },

    handleCurrentChange(val) {
      this.currentPage = val
    },

    // 打开新增对话框
    openAddDialog() {
      if (this.contracts.length === 0) {
        this.$message.warning('请先添加合同')
        return
      }
      this.isEdit = false
      this.dialogTitle = '新增发票'
      this.resetForm()
      // 生成默认发票编号
      const maxNumber = Math.max(...this.invoices.map(i => parseInt(i.invoiceNumber.replace('FP', '')) || 0), 0)
      this.invoiceForm.invoiceNumber = `FP${(maxNumber + 1).toString().padStart(6, '0')}`
      this.dialogVisible = true
    },

    // 打开编辑对话框
    openEditDialog(row) {
      this.isEdit = true
      this.dialogTitle = '编辑发票'
      this.invoiceForm = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },

    // 重置表单
    resetForm() {
      this.invoiceForm = {
        id: '',
        invoiceNumber: '',
        contractId: '',
        contractName: '',
        invoiceAmount: 0,
        taxRate: 0.13,
        taxAmount: 0,
        totalAmount: 0,
        invoiceDate: '',
        status: '已开票',
        remark: ''
      }
      if (this.$refs.invoiceForm) {
        this.$refs.invoiceForm.resetFields()
      }
    },

    // 合同选择变化
    handleContractChange(contractId) {
      const contract = this.contracts.find(c => c.id === contractId)
      this.invoiceForm.contractName = contract ? `${contract.contractNumber} - ${contract.contractName}` : ''
    },

    // 计算税额和价税合计
    calculateTax() {
      const amount = parseFloat(this.invoiceForm.invoiceAmount) || 0
      const rate = parseFloat(this.invoiceForm.taxRate) || 0
      this.invoiceForm.taxAmount = amount * rate
      this.invoiceForm.totalAmount = amount + this.invoiceForm.taxAmount
    },

    // 检查发票编号唯一性
    checkInvoiceNumberUnique(rule, value, callback) {
      if (!value) return callback()
      const exists = this.invoices.some(invoice => 
        invoice.invoiceNumber === value && invoice.id !== this.invoiceForm.id
      )
      if (exists) {
        callback(new Error('发票编号已存在'))
      } else {
        callback()
      }
    },

    // 保存发票
    saveInvoice() {
      this.$refs.invoiceForm.validate((valid) => {
        if (valid) {
          if (this.isEdit) {
            // 编辑
            const index = this.invoices.findIndex(i => i.id === this.invoiceForm.id)
            if (index !== -1) {
              this.invoices[index] = JSON.parse(JSON.stringify(this.invoiceForm))
              this.$message.success('发票编辑成功')
            }
          } else {
            // 新增
            this.invoiceForm.id = Date.now()
            this.invoices.push(JSON.parse(JSON.stringify(this.invoiceForm)))
            this.$message.success('发票新增成功')
          }
          this.saveToLocalStorage()
          this.handleSearch()
          this.dialogVisible = false
        }
      })
    },

    // 删除发票
    deleteInvoice(id) {
      const invoice = this.invoices.find(i => i.id === id)
      if (!invoice) return

      this.$confirm(`确定要删除发票"${invoice.invoiceNumber}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.invoices = this.invoices.filter(i => i.id !== id)
        this.saveToLocalStorage()
        this.handleSearch()
        this.$message.success('删除成功')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.invoice-management {
  width: 100%;
}

.top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.dialog-footer {
  text-align: right;
}
</style>