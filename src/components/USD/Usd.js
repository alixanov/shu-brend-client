import React, { useState, useEffect } from "react";
import { Row, Col, Input, Button, message, Grid } from "antd";
import { SaveOutlined } from '@ant-design/icons';
import {
  useGetUsdRateQuery,
  useUpdateUsdRateMutation,
} from "../../context/service/usd.service";

const { useBreakpoint } = Grid;

export default function Usd() {
  const screens = useBreakpoint();
  const { data: usdRateData, isLoading: isUsdRateLoading } = useGetUsdRateQuery();
  const [updateUsdRate] = useUpdateUsdRateMutation();
  const [usdRate, setUsdRate] = useState(usdRateData?.rate || 1);

  useEffect(() => {
    if (usdRateData) {
      setUsdRate(usdRateData.rate);
    }
  }, [usdRateData]);

  const handleUsdRateChange = async () => {
    try {
      await updateUsdRate(usdRate).unwrap();
      message.success("USD kursi muvaffaqiyatli yangilandi!");
    } catch (error) {
      message.error("Xatolik yuz berdi. Iltimos qayta urinib ko'ring.");
    }
  };

  // Размеры для мобильных устройств
  const inputSize = screens.xs ? "small" : "middle";
  const buttonSize = screens.xs ? "small" : "middle";
  const buttonStyle = screens.xs ? {
    marginLeft: '10px',
    padding: '0 8px',
    minWidth: '32px'
  } : {
    marginLeft: '20px'
  };

  return (
    <div className="admin-buttons">
      <Row gutter={screens.xs ? 8 : 16} align="middle">
        <Col span={screens.xs ? 18 : 20}>
          <Input
            size={inputSize}
            placeholder="Bugungi USD kursini kiriting"
            value={usdRate}
            onChange={(e) => setUsdRate(e.target.value)}
          />
        </Col>
        <Col span={screens.xs ? 6 : 4}>
          <Button
            size={buttonSize}
            style={{
              ...buttonStyle,
              background: "#1a2a6b",
              color: "white",
            }}
            onClick={handleUsdRateChange}
            icon={screens.xs ? <SaveOutlined /> : null}
          >
            {screens.xs ? null : "Saqlash"}
          </Button>
        </Col>
      </Row>
    </div>
  );
}