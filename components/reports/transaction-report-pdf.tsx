import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { formatCurrency } from "@/lib/utils/currency"

// Register font (optional, using default Helvetica for now for simplicity/speed)
// Font.register({ family: 'Roboto', src: '...' });

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: "Helvetica",
    },
    header: {
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#112233",
        paddingBottom: 10,
    },
    title: {
        fontSize: 24,
        marginBottom: 5,
        fontWeight: "bold",
        color: "#112233",
    },
    subtitle: {
        fontSize: 12,
        color: "#666",
    },
    summarySection: {
        marginTop: 30,
        backgroundColor: "#f8f9fa",
        padding: 15,
        borderRadius: 4,
    },
    summaryTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 5,
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 3,
    },
    accountSection: {
        marginBottom: 25,
    },
    accountHeader: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 10,
        color: "#333",
    },
    table: {
        display: "flex",
        width: "auto",
    },
    tableHeaderRow: {
        flexDirection: "row",
        borderTopWidth: 2,
        borderTopColor: "#000000",
        paddingVertical: 5,
        alignItems: "center",
    },
    tableRow: {
        flexDirection: "row",
        paddingVertical: 4,
        alignItems: "center",
    },
    // Columns - Widths only
    colDate: { width: "12%" },
    colDesc: { width: "33%" },
    colCat: { width: "15%" },
    colCreated: { width: "20%" },
    colAmount: { width: "20%" },

    // Text Styles
    tableCellHeader: {
        margin: 2,
        fontSize: 8,
        fontWeight: "bold",
    },
    tableCell: {
        margin: 2,
        fontSize: 7,
    },
    amountCell: {
        margin: 2,
        fontSize: 7,
        textAlign: "right",
    },
    subtotalRow: {
        flexDirection: "row",
        paddingTop: 5,
        marginTop: 5,
        justifyContent: "flex-end",
        alignItems: "center",
    },
    positive: { color: "green" },
    negative: { color: "red" },
    emptyMessage: {
        fontStyle: "italic",
        color: "#666",
        padding: 5,
        fontSize: 8,
    }
})

interface Transaction {
    id: string
    date: string
    created_at: string
    description: string | null
    amount: number
    type: string
    category?: { name: string }
}

interface AccountGroup {
    account: {
        id: string
        name: string
        currency: string
        type: string
    }
    transactions: Transaction[]
    subtotal: number
}

interface ReportData {
    groupedData: AccountGroup[]
    grandTotal: number
    period: { start: string; end: string }
}

export const TransactionReportPDF = ({ data }: { data: ReportData }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Reporte de Movimientos</Text>
                <Text style={styles.subtitle}>
                    Periodo: {format(new Date(data.period.start), "dd/MM/yyyy")} - {format(new Date(data.period.end), "dd/MM/yyyy")}
                </Text>
                <Text style={styles.subtitle}>Generado el: {format(new Date(), "dd/MM/yyyy HH:mm")}</Text>
            </View>

            {/* Account Groups */}
            {data.groupedData.map((group, index) => (
                <View key={index} style={styles.accountSection}>
                    <Text style={styles.accountHeader}>
                        {group.account.name} ({group.account.currency})
                    </Text>

                    {group.transactions.length > 0 ? (
                        <View style={styles.table}>
                            {/* Table Header */}
                            <View style={styles.tableHeaderRow}>
                                <View style={styles.colDate}>
                                    <Text style={styles.tableCellHeader}>Fecha</Text>
                                </View>
                                <View style={styles.colDesc}>
                                    <Text style={styles.tableCellHeader}>Descripción</Text>
                                </View>
                                <View style={styles.colCat}>
                                    <Text style={styles.tableCellHeader}>Categoría</Text>
                                </View>
                                <View style={styles.colCreated}>
                                    <Text style={styles.tableCellHeader}>Creado</Text>
                                </View>
                                <View style={styles.colAmount}>
                                    <Text style={[styles.tableCellHeader, { textAlign: 'right' }]}>Monto</Text>
                                </View>
                            </View>

                            {/* Table Rows */}
                            {group.transactions.map((t, idx) => (
                                <View
                                    style={[
                                        styles.tableRow,
                                        idx % 2 !== 0 ? { backgroundColor: "#f3f4f6" } : {}
                                    ]}
                                    key={t.id}
                                >
                                    <View style={styles.colDate}>
                                        <Text style={styles.tableCell}>{format(new Date(t.date), "dd/MM/yy")}</Text>
                                    </View>
                                    <View style={styles.colDesc}>
                                        <Text style={styles.tableCell}>{t.description || "Sin descripción"}</Text>
                                    </View>
                                    <View style={styles.colCat}>
                                        <Text style={styles.tableCell}>{t.category?.name || "-"}</Text>
                                    </View>
                                    <View style={styles.colCreated}>
                                        <Text style={styles.tableCell}>{format(new Date(t.created_at), "dd/MM/yy HH:mm")}</Text>
                                    </View>
                                    <View style={styles.colAmount}>
                                        <Text style={[styles.amountCell, t.type === 'expense' ? styles.negative : styles.positive]}>
                                            {t.type === 'expense' ? '-' : '+'}${formatCurrency(t.amount)}
                                        </Text>
                                    </View>
                                </View>
                            ))}

                            {/* Subtotal Row */}
                            <View style={styles.subtotalRow}>
                                <View style={styles.colDate} />
                                <View style={styles.colDesc} />
                                <View style={styles.colCat} />
                                <View style={styles.colCreated}>
                                    <Text style={[styles.tableCell, { fontWeight: 'bold', textAlign: 'right', fontSize: 8 }]}>Subtotal {group.account.name}:</Text>
                                </View>
                                <View style={styles.colAmount}>
                                    <Text style={[styles.amountCell, { fontWeight: "bold", fontSize: 8, color: group.subtotal >= 0 ? "green" : "red" }]}>
                                        ${formatCurrency(group.subtotal)}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    ) : (
                        <Text style={styles.emptyMessage}>Sin movimientos en este periodo.</Text>
                    )}
                </View>
            ))}

            {/* Summary at the bottom */}
            <View style={styles.summarySection}>
                <Text style={styles.summaryTitle}>Resumen General</Text>
                <View style={styles.summaryRow}>
                    <Text>Cuentas Incluidas:</Text>
                    <Text>{data.groupedData.length}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text>Total General:</Text>
                    <Text style={{ fontWeight: "bold", color: data.grandTotal >= 0 ? "green" : "red" }}>
                        ${formatCurrency(data.grandTotal)}
                    </Text>
                </View>
            </View>
        </Page>
    </Document>
)
