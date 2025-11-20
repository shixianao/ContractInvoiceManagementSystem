<template>
  <div class="contract-management">
    <!-- 顶部操作栏 -->
    <div class="top-bar">
      <el-input
        v-model="searchKeyword"
        placeholder="请输入合同编号或名称"
        prefix-icon="el-icon-search"
        style="width: 300px; margin-right: 10px"
        @input="handleSearch"
      />
      <el-button type="primary" @click="openAddDialog" icon="el-icon-plus">新增合同</el-button>
    </div>

    <!-- 合同列表 -->
    <el-table
      :data="filteredContracts"
      style="width: 100%; margin-top: 20px"
      stripe
      :header-cell-style="{ background: '#333', color: '#fff' }"
      :row-style="{ background: '#262626', color: '#fff' }"
    >
      <el-table-column prop="contractNumber" label="合同编号" width="150" />
      <el-table-column prop="contractName" label="合同名称" min-width="200" />
      <el-table-column prop="customerName" label="客户名称" width="150" />
      <el-table-column prop="contractAmount" label="合同金额" width="120" align="right">
        <template slot-scope="scope">{{ scope.row.contractAmount.toFixed(2) }}元</template>
      </el-table-column>
      <el-table-column prop="signDate" label="签订日期" width="120" />
      <el-table-column prop="startDate" label="开始日期" width="120" />
      <el-table-column prop="endDate" label="结束日期" width="120" />
      <el-table-column prop="status" label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === '生效' ? 'success' : 'warning'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="small" @click="openEditDialog(scope.row)" style="margin-right: 5px">编辑</el-button>
          <el-button type="danger" size="small" @click="deleteContract(scope.row.id)">删除</el-button>
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
        :total="filteredContracts.length"
      />
    </div>

    <!-- 新增/编辑合同对话框 -->
    <el-dialog
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="600px"
      @close="resetForm"
    >
      <el-form :model="contractForm" :rules="contractRules" ref="contractForm" label-width="120px">
        <el-form-item label="合同编号" prop="contractNumber">
          <el-input v-model="contractForm.contractNumber" placeholder="请输入合同编号" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="合同名称" prop="contractName">
          <el-input v-model="contractForm.contractName" placeholder="请输入合同名称" />
        </el-form-item>
        <el-form-item label="客户名称" prop="customerName">
          <el-input v-model="contractForm.customerName" placeholder="请输入客户名称" />
        </el-form-item>
        <el-form-item label="合同金额" prop="contractAmount">
          <el-input-number
            v-model="contractForm.contractAmount"
            placeholder="请输入合同金额"
            :min="0"
            :precision="2"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="签订日期" prop="signDate">
          <el-date-picker v-model="contractForm.signDate" type="date" placeholder="选择签订日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="开始日期" prop="startDate">
          <el-date-picker v-model="contractForm.startDate" type="date" placeholder="选择开始日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="结束日期" prop="endDate">
          <el-date-picker v-model="contractForm.endDate" type="date" placeholder="选择结束日期" style="width: 100%" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="contractForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option label="生效" value="生效" />
            <el-option label="未生效" value="未生效" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="contractForm.remark" type="textarea" placeholder="请输入备注" :rows="3" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveContract">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'ContractManagement',
  data() {
    return {
      contracts: [],
      filteredContracts: [],
      searchKeyword: '',
      currentPage: 1,
      pageSize: 10,
      dialogVisible: false,
      isEdit: false,
      dialogTitle: '',
      contractForm: {
        id: '',
        contractNumber: '',
        contractName: '',
        customerName: '',
        contractAmount: 0,
        signDate: '',
        startDate: '',
        endDate: '',
        status: '生效',
        remark: ''
      },
      contractRules: {
        contractNumber: [
          { required: true, message: '请输入合同编号', trigger: 'blur' },
          { validator: this.checkContractNumberUnique, trigger: 'blur' }
        ],
        contractName: [
          { required: true, message: '请输入合同名称', trigger: 'blur' }
        ],
        customerName: [
          { required: true, message: '请输入客户名称', trigger: 'blur' }
        ],
        contractAmount: [
          { required: true, message: '请输入合同金额', trigger: 'blur' }
        ],
        signDate: [
          { required: true, message: '请选择签订日期', trigger: 'change' }
        ],
        startDate: [
          { required: true, message: '请选择开始日期', trigger: 'change' }
        ],
        endDate: [
          { required: true, message: '请选择结束日期', trigger: 'change' }
        ],
        status: [
          { required: true, message: '请选择状态', trigger: 'change' }
        ]
      }
    }
  },
  mounted() {
    this.loadContracts()
  },
  methods: {
    // 加载合同数据
    loadContracts() {
      const contracts = window.localStorage.getItem('contracts')
      if (contracts) {
        this.contracts = JSON.parse(contracts)
      } else {
        // 初始化一些示例数据
        this.contracts = [
          {
            id: Date.now() + 1,
            contractNumber: 'HT2024001',
            contractName: '软件开发合同',
            customerName: '科技有限公司',
            contractAmount: 50000.00,
            signDate: '2024-01-15',
            startDate: '2024-01-20',
            endDate: '2024-06-20',
            status: '生效',
            remark: '这是一个软件开发合同示例'
          },
          {
            id: Date.now() + 2,
            contractNumber: 'HT2024002',
            contractName: '咨询服务合同',
            customerName: '咨询有限公司',
            contractAmount: 20000.00,
            signDate: '2024-02-01',
            startDate: '2024-02-05',
            endDate: '2024-05-05',
            status: '生效',
            remark: '这是一个咨询服务合同示例'
          }
        ]
        this.saveToLocalStorage()
      }
      this.filteredContracts = [...this.contracts]
    },

    // 保存到本地存储
    saveToLocalStorage() {
      window.localStorage.setItem('contracts', JSON.stringify(this.contracts))
    },

    // 搜索
    handleSearch() {
      if (!this.searchKeyword) {
        this.filteredContracts = [...this.contracts]
      } else {
        this.filteredContracts = this.contracts.filter(contract => 
          contract.contractNumber.includes(this.searchKeyword) ||
          contract.contractName.includes(this.searchKeyword)
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
      this.isEdit = false
      this.dialogTitle = '新增合同'
      this.resetForm()
      // 生成默认合同编号
      const maxNumber = Math.max(...this.contracts.map(c => parseInt(c.contractNumber.replace('HT', '')) || 0), 0)
      this.contractForm.contractNumber = `HT${(maxNumber + 1).toString().padStart(6, '0')}`
      this.dialogVisible = true
    },

    // 打开编辑对话框
    openEditDialog(row) {
      this.isEdit = true
      this.dialogTitle = '编辑合同'
      this.contractForm = JSON.parse(JSON.stringify(row))
      this.dialogVisible = true
    },

    // 重置表单
    resetForm() {
      this.contractForm = {
        id: '',
        contractNumber: '',
        contractName: '',
        customerName: '',
        contractAmount: 0,
        signDate: '',
        startDate: '',
        endDate: '',
        status: '生效',
        remark: ''
      }
      if (this.$refs.contractForm) {
        this.$refs.contractForm.resetFields()
      }
    },

    // 检查合同编号唯一性
    checkContractNumberUnique(rule, value, callback) {
      if (!value) return callback()
      const exists = this.contracts.some(contract => 
        contract.contractNumber === value && contract.id !== this.contractForm.id
      )
      if (exists) {
        callback(new Error('合同编号已存在'))
      } else {
        callback()
      }
    },

    // 保存合同
    saveContract() {
      this.$refs.contractForm.validate((valid) => {
        if (valid) {
          if (this.isEdit) {
            // 编辑
            const index = this.contracts.findIndex(c => c.id === this.contractForm.id)
            if (index !== -1) {
              this.contracts[index] = JSON.parse(JSON.stringify(this.contractForm))
              this.$message.success('合同编辑成功')
            }
          } else {
            // 新增
            this.contractForm.id = Date.now()
            this.contracts.push(JSON.parse(JSON.stringify(this.contractForm)))
            this.$message.success('合同新增成功')
          }
          this.saveToLocalStorage()
          this.handleSearch()
          this.dialogVisible = false
        }
      })
    },

    // 删除合同
    deleteContract(id) {
      const contract = this.contracts.find(c => c.id === id)
      if (!contract) return

      // 检查是否有发票关联
      const invoices = JSON.parse(window.localStorage.getItem('invoices') || '[]')
      const hasInvoice = invoices.some(invoice => invoice.contractId === id)
      if (hasInvoice) {
        this.$message.error('该合同已有发票关联，无法删除')
        return
      }

      this.$confirm(`确定要删除合同"${contract.contractName}"吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.contracts = this.contracts.filter(c => c.id !== id)
        this.saveToLocalStorage()
        this.handleSearch()
        this.$message.success('删除成功')
      }).catch(() => {})
    }
  }
}
</script>

<style scoped>
.contract-management {
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