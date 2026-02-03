"use client"

import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { InvoiceProduct } from "../invoice-wizard"
import { Plus, Trash2, Package, ChevronLeft } from "lucide-react"

interface ProductsStepProps {
  userId: string
  initialProducts: InvoiceProduct[]
  onProductsSaved: (products: InvoiceProduct[]) => void
  onBack: () => void
}

export function ProductsStep({
  userId,
  initialProducts,
  onProductsSaved,
  onBack,
}: ProductsStepProps) {
  const t = useTranslations("Invoicing")
  const { toast } = useToast()
  const supabase = createClient()

  const [isLoading, setIsLoading] = useState(false)
  const [savedProducts, setSavedProducts] = useState<InvoiceProduct[]>([])
  const [selectedProducts, setSelectedProducts] = useState<InvoiceProduct[]>(
    initialProducts.length > 0 ? initialProducts : []
  )

  // Current product form
  const [isNewProduct, setIsNewProduct] = useState(true)
  const [productKey, setProductKey] = useState("")
  const [description, setDescription] = useState("")
  const [unitKey, setUnitKey] = useState("E48")
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)
  const [taxRate, setTaxRate] = useState(16)

  useEffect(() => {
    loadSavedProducts()
  }, [])

  const loadSavedProducts = async () => {
    try {
      const { data, error } = await supabase
        .from("invoice_products")
        .select("*")
        .eq("user_id", userId)
        .order("description")

      if (error) throw error
      setSavedProducts(data || [])
    } catch (error) {
      console.error("Error loading products:", error)
    }
  }

  const handleProductSelect = (productId: string) => {
    const product = savedProducts.find((p) => p.id === productId)
    if (product) {
      setIsNewProduct(false)
      setProductKey(product.product_key)
      setDescription(product.description)
      setUnitKey(product.unit_key)
      setUnitPrice(product.unit_price)
      setTaxRate(product.tax_rate)
    }
  }

  const calculateTotals = () => {
    const subtotal = quantity * unitPrice
    const tax = subtotal * (taxRate / 100)
    const total = subtotal + tax
    return { subtotal, tax, total }
  }

  const handleAddProduct = async () => {
    if (!productKey || !description || !unitKey || quantity <= 0 || unitPrice <= 0) {
      toast({
        title: t("error"),
        description: "Completa todos los campos del producto",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { subtotal, tax, total } = calculateTotals()

      // Save product to database if new
      if (isNewProduct) {
        const { error } = await supabase.from("invoice_products").insert({
          user_id: userId,
          product_key: productKey,
          description,
          unit_key: unitKey,
          unit_price: unitPrice,
          tax_rate: taxRate,
        })

        if (error) throw error

        toast({
          title: t("success"),
          description: t("productSaved"),
        })

        await loadSavedProducts()
      }

      // Add to selected products
      const newProduct: InvoiceProduct = {
        product_key: productKey,
        description,
        unit_key: unitKey,
        quantity,
        unit_price: unitPrice,
        tax_rate: taxRate,
        subtotal,
        tax,
        total,
      }

      setSelectedProducts([...selectedProducts, newProduct])

      // Reset form
      setIsNewProduct(true)
      setProductKey("")
      setDescription("")
      setUnitKey("E48")
      setQuantity(1)
      setUnitPrice(0)
      setTaxRate(16)
    } catch (error) {
      console.error("Error adding product:", error)
      toast({
        title: t("error"),
        description: t("productSaveError"),
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemoveProduct = (index: number) => {
    setSelectedProducts(selectedProducts.filter((_, i) => i !== index))
  }

  const handleContinue = () => {
    if (selectedProducts.length === 0) {
      toast({
        title: t("error"),
        description: t("noProducts"),
        variant: "destructive",
      })
      return
    }

    onProductsSaved(selectedProducts)
  }

  const totals = selectedProducts.reduce(
    (acc, product) => ({
      subtotal: acc.subtotal + product.subtotal,
      tax: acc.tax + product.tax,
      total: acc.total + product.total,
    }),
    { subtotal: 0, tax: 0, total: 0 }
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{t("step2")}</h2>
      </div>

      {/* Product Form */}
      <Card className="p-4 bg-muted/30">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">{t("addProduct")}</h3>
          </div>

          {/* Select Existing Product */}
          <div className="space-y-2">
            <Label>{t("selectProduct")}</Label>
            <Select
              onValueChange={(value) => {
                if (value === "new") {
                  setIsNewProduct(true)
                  setProductKey("")
                  setDescription("")
                  setUnitKey("E48")
                  setUnitPrice(0)
                  setTaxRate(16)
                } else {
                  handleProductSelect(value)
                }
              }}
            >
              <SelectTrigger className="h-11">
                <SelectValue placeholder={t("selectProduct")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">{t("addNewProduct")}</SelectItem>
                {savedProducts.map((product) => (
                  <SelectItem key={product.id} value={product.id!}>
                    {product.description} - ${product.unit_price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="product_key">{t("productCode")}</Label>
              <Input
                id="product_key"
                value={productKey}
                onChange={(e) => setProductKey(e.target.value)}
                placeholder={t("productCodePlaceholder")}
                disabled={!isNewProduct}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_key">{t("productUnit")}</Label>
              <Input
                id="unit_key"
                value={unitKey}
                onChange={(e) => setUnitKey(e.target.value)}
                placeholder={t("productUnitPlaceholder")}
                disabled={!isNewProduct}
                className="h-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("productDescription")}</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t("productDescriptionPlaceholder")}
              disabled={!isNewProduct}
              className="h-11"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="quantity">{t("productQuantity")}</Label>
              <Input
                id="quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                min="1"
                step="1"
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit_price">{t("productPrice")}</Label>
              <Input
                id="unit_price"
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                min="0"
                step="0.01"
                disabled={!isNewProduct}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax_rate">{t("productTax")}</Label>
              <Input
                id="tax_rate"
                type="number"
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
                min="0"
                max="100"
                disabled={!isNewProduct}
                className="h-11"
              />
            </div>
          </div>

          <div className="flex justify-between items-center pt-2 border-t">
            <div className="text-sm space-y-1">
              <div>
                {t("productSubtotal")}: ${calculateTotals().subtotal.toFixed(2)}
              </div>
              <div>
                {t("iva")} ({taxRate}%): ${calculateTotals().tax.toFixed(2)}
              </div>
              <div className="font-bold">
                {t("productTotal")}: ${calculateTotals().total.toFixed(2)}
              </div>
            </div>
            <Button type="button" onClick={handleAddProduct} disabled={isLoading}>
              <Plus className="h-4 w-4 mr-2" />
              {t("addProduct")}
            </Button>
          </div>
        </div>
      </Card>

      {/* Selected Products List */}
      {selectedProducts.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">{t("products")}</h3>
          {selectedProducts.map((product, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="font-medium">{product.description}</h4>
                  <p className="text-sm text-muted-foreground">
                    Clave: {product.product_key} | Unidad: {product.unit_key}
                  </p>
                  <div className="mt-2 text-sm space-y-1">
                    <div>
                      {product.quantity} x ${product.unit_price.toFixed(2)} = $
                      {product.subtotal.toFixed(2)}
                    </div>
                    <div>
                      IVA ({product.tax_rate}%): ${product.tax.toFixed(2)}
                    </div>
                    <div className="font-semibold">Total: ${product.total.toFixed(2)}</div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveProduct(index)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </Card>
          ))}

          {/* Totals */}
          <Card className="p-4 bg-primary/5">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>{t("subtotal")}:</span>
                <span className="font-semibold">${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>{t("iva")}:</span>
                <span className="font-semibold">${totals.tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>{t("total")}:</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          <ChevronLeft className="h-4 w-4 mr-2" />
          {t("back")}
        </Button>
        <Button
          type="button"
          onClick={handleContinue}
          disabled={selectedProducts.length === 0}
          className="flex-1"
        >
          {t("continue")}
        </Button>
      </div>
    </div>
  )
}
