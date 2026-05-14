"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, CreditCard, Activity, Settings, Database, Shield, DollarSign } from "lucide-react"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950/20 to-slate-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent mb-2">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Quản lý hệ thống TCK AI</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard
            title="Total Users"
            value="1,234"
            change="+12%"
            icon={Users}
            color="from-blue-500 to-cyan-500"
          />
          <StatsCard
            title="Active Subscriptions"
            value="567"
            change="+8%"
            icon={CreditCard}
            color="from-purple-500 to-pink-500"
          />
          <StatsCard
            title="API Requests Today"
            value="45.6K"
            change="+23%"
            icon={Activity}
            color="from-green-500 to-emerald-500"
          />
          <StatsCard
            title="Revenue This Month"
            value="12.5M VND"
            change="+15%"
            icon={DollarSign}
            color="from-orange-500 to-red-500"
          />
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
            <TabsTrigger value="overview">Tổng quan</TabsTrigger>
            <TabsTrigger value="users">Người dùng</TabsTrigger>
            <TabsTrigger value="payments">Thanh toán</TabsTrigger>
            <TabsTrigger value="api">Quản lý API</TabsTrigger>
            <TabsTrigger value="plans">Gói dịch vụ</TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <OverviewTab />
          </TabsContent>

          <TabsContent value="users">
            <UsersTab />
          </TabsContent>

          <TabsContent value="payments">
            <PaymentsTab />
          </TabsContent>

          <TabsContent value="api">
            <ApiManagementTab />
          </TabsContent>

          <TabsContent value="plans">
            <PlansTab />
          </TabsContent>

          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function StatsCard({ title, value, change, icon: Icon, color }: any) {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/20 backdrop-blur-xl">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className={`p-2 rounded-lg bg-gradient-to-br ${color}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground mt-1">
          <span className="text-green-500">{change}</span> so với tháng trước
        </p>
      </CardContent>
    </Card>
  )
}

function OverviewTab() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/20 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Hoạt động gần đây</CardTitle>
          <CardDescription>Số liệu thống kê trong 7 ngày qua</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-purple-500/10 rounded-lg">
              <span>Tin nhắn mới</span>
              <Badge className="bg-purple-500">12,345</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
              <span>Người dùng mới</span>
              <Badge className="bg-blue-500">234</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
              <span>Gói nâng cấp</span>
              <Badge className="bg-green-500">56</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/20 backdrop-blur-xl">
        <CardHeader>
          <CardTitle>Trạng thái hệ thống</CardTitle>
          <CardDescription>Sức khỏe của các dịch vụ</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
              <span>API Gateway</span>
              <Badge className="bg-green-500">Online</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
              <span>Database</span>
              <Badge className="bg-green-500">Online</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-500/10 rounded-lg">
              <span>Redis Cache</span>
              <Badge className="bg-green-500">Online</Badge>
            </div>
            <div className="flex items-center justify-between p-3 bg-yellow-500/10 rounded-lg">
              <span>Vector Memory</span>
              <Badge className="bg-yellow-500">Degraded</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function UsersTab() {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/20 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Quản lý người dùng</CardTitle>
        <CardDescription>Xem và quản lý tất cả người dùng</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { id: 1, email: "user1@example.com", plan: "Pro", status: "Active" },
            { id: 2, email: "user2@example.com", plan: "Free", status: "Active" },
            { id: 3, email: "user3@example.com", plan: "Ultra", status: "Active" },
          ].map((user) => (
            <div key={user.id} className="flex items-center justify-between p-4 bg-purple-500/5 rounded-lg border border-purple-500/10">
              <div>
                <div className="font-medium">{user.email}</div>
                <div className="text-sm text-muted-foreground">{user.plan}</div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{user.status}</Badge>
                <Button variant="ghost" size="sm">Edit</Button>
                <Button variant="destructive" size="sm">Ban</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PaymentsTab() {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/20 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Quản lý thanh toán</CardTitle>
        <CardDescription>Xác nhận và từ chối yêu cầu thanh toán</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[
            { id: 1, user: "user1@example.com", plan: "Pro", amount: "99,000 VND", status: "PENDING" },
            { id: 2, user: "user2@example.com", plan: "Ultra", amount: "199,000 VND", status: "PENDING" },
          ].map((payment) => (
            <div key={payment.id} className="flex items-center justify-between p-4 bg-purple-500/5 rounded-lg border border-purple-500/10">
              <div>
                <div className="font-medium">{payment.user}</div>
                <div className="text-sm text-muted-foreground">{payment.plan} - {payment.amount}</div>
              </div>
              <div className="flex gap-2">
                <Badge variant="outline">{payment.status}</Badge>
                <Button variant="default" size="sm" className="bg-green-600 hover:bg-green-700">Approve</Button>
                <Button variant="destructive" size="sm">Reject</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function ApiManagementTab() {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/20 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Quản lý API Keys</CardTitle>
        <CardDescription>Thêm, xóa và quản lý API keys cho các nhà cung cấp</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4 mb-4">
            <Button className="bg-gradient-to-r from-purple-600 to-blue-600">Thêm API Key</Button>
            <Button variant="outline">Reset Health</Button>
          </div>
          {[
            { provider: "GLM", model: "GLM-4.5-Flash", keys: 3, health: 95 },
            { provider: "GEMINI", model: "gemini-2.5-flash-lite", keys: 2, health: 88 },
            { provider: "DEEPSEEK", model: "DeepSeek-V3", keys: 4, health: 92 },
          ].map((api) => (
            <div key={`${api.provider}-${api.model}`} className="flex items-center justify-between p-4 bg-purple-500/5 rounded-lg border border-purple-500/10">
              <div>
                <div className="font-medium">{api.provider} - {api.model}</div>
                <div className="text-sm text-muted-foreground">{api.keys} keys • Health: {api.health}%</div>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm">Edit</Button>
                <Button variant="destructive" size="sm">Remove</Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function PlansTab() {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/20 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Quản lý gói dịch vụ</CardTitle>
        <CardDescription>Chỉnh sửa giá, credits và tính năng của các gói</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { name: "Free", price: "0", credits: 300 },
            { name: "Pro", price: "99,000", credits: 3000 },
            { name: "Ultra", price: "199,000", credits: 10000 },
            { name: "Max", price: "499,000", credits: 50000 },
          ].map((plan) => (
            <div key={plan.name} className="p-4 bg-purple-500/5 rounded-lg border border-purple-500/10">
              <div className="font-medium text-lg mb-2">{plan.name}</div>
              <div className="text-2xl font-bold mb-2">{plan.price} VND</div>
              <div className="text-sm text-muted-foreground">{plan.credits} credits/ngày</div>
              <Button variant="outline" className="w-full mt-4">Edit Plan</Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

function SettingsTab() {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-purple-500/20 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Cài đặt hệ thống</CardTitle>
        <CardDescription>Quản lý thông tin liên hệ và cấu hình hệ thống</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Thông tin liên hệ</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <span className="w-32 text-sm text-muted-foreground">Facebook:</span>
                <input className="flex-1 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2 text-sm" defaultValue="https://facebook.com/tckai" />
              </div>
              <div className="flex items-center gap-4">
                <span className="w-32 text-sm text-muted-foreground">Zalo:</span>
                <input className="flex-1 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2 text-sm" defaultValue="0123456789" />
              </div>
              <div className="flex items-center gap-4">
                <span className="w-32 text-sm text-muted-foreground">Phone:</span>
                <input className="flex-1 bg-purple-500/10 border border-purple-500/20 rounded-lg px-3 py-2 text-sm" defaultValue="0123456789" />
              </div>
            </div>
          </div>
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600">Lưu cài đặt</Button>
        </div>
      </CardContent>
    </Card>
  )
}
